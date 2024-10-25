from fastapi import FastAPI, WebSocket, Request, Form, Depends, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime
import serial
import time
import threading

# Configurações de serial
porta_serial = 'COM9'
baudrate = 9600
bits_de_dados = 8
paridade = serial.PARITY_NONE
bits_de_parada = serial.STOPBITS_ONE
tamanho_leitura = 7

ultimo_dado_balança = None
executando = True

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializa os templates do Jinja2
templates = Jinja2Templates(directory="templates")

# Configuração do SQLAlchemy
DATABASE_URL = "sqlite:///./food_data.db"  
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelos de tabela
class Food(Base):
    __tablename__ = "foods"
    food_id = Column(Integer, primary_key=True, index=True)
    food_name = Column(String, unique=True, index=True)
    price = Column(Float)

class FoodReading(Base):
    __tablename__ = "food_readings"
    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("foods.food_id"))
    weight = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)
    food = relationship("Food")

# Criação das tabelas no banco de dados
Base.metadata.create_all(bind=engine)

class FoodItem(BaseModel):
    foodId: int
    foodName: str
    foodPrice: float

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Gerencia a conexão WebSocket e atualizações
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Rota WebSocket para atualizações em tempo real
@app.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # Recebe mensagens dos clientes (se necessário)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Função para processar e salvar as leituras
@app.post("/submit")
async def submit_form(food_item: FoodItem, db: SessionLocal = Depends(get_db)):
    food_id = food_item.foodId
    food_name = food_item.foodName
    food_price = food_item.foodPrice

    if ultimo_dado_balança is not None:
        reading = int(ultimo_dado_balança) / 100
    else:
        reading = 10.52

    # Verifica se o item de comida já existe, senão cria
    food = db.query(Food).filter(Food.food_id == food_id).first()
    if not food:
        food = Food(food_id=food_id, food_name=food_name, price=food_price)
        db.add(food)
        db.commit()
        db.refresh(food)
    
    new_reading = FoodReading(food_id=food.food_id, weight=reading)
    db.add(new_reading)
    db.commit()

    # Envia dados de atualização via WebSocket
    await manager.broadcast(f"New reading: {reading}")
    return RedirectResponse(url="/", status_code=200)

# Função para obter dados de resumo
@app.get("/food-waste/summary")
async def get_summary(db: SessionLocal = Depends(get_db)):
    total_weight = db.query(func.sum(FoodReading.weight)).scalar() or 0
    total_value = db.query(func.sum(FoodReading.weight * Food.price)).join(Food).scalar() or 0
    total_transactions = db.query(FoodReading).count()
    return JSONResponse(content={
        "total_weight": total_weight,
        "total_value": total_value,
        "total_transactions": total_transactions
    })

# Função para obter dados para gráficos
@app.get("/food-waste/graph-data")
async def get_graph_data(db: SessionLocal = Depends(get_db)):
    results = db.query(
        Food.food_name,
        func.sum(FoodReading.weight).label("total_weight")
    ).join(FoodReading).group_by(Food.food_name).all()

    labels = [result.food_name for result in results]
    data = [result.total_weight for result in results]

    return JSONResponse(content={"labels": labels, "data": data})

# Função para ler dados da balança
def ler_dados_balança():
    global ultimo_dado_balança, executando
    try:
        ser = serial.Serial(
            porta_serial,
            baudrate,
            bytesize=bits_de_dados,
            parity=paridade,
            stopbits=bits_de_parada,
            timeout=1
        )

        while executando:
            try:
                dados_brutos = ser.read(tamanho_leitura)
                if len(dados_brutos) > 0:
                    dados_filtrados = dados_brutos.replace(b'\x02', b'').replace(b'\x03', b'')
                    try:
                        dados_decodificados = dados_filtrados.decode('utf-8').strip()
                        ultimo_dado_balança = dados_decodificados
                    except UnicodeDecodeError:
                        print("Erro ao decodificar os dados.")
            except serial.SerialException as e:
                print(f"Erro de comunicação: {e}")
                break
    except serial.SerialException as e:
        print(f"Erro ao conectar à porta serial: {e}")
    finally:
        if ser.is_open:
            ser.close()

# Inicia a thread para leitura da balança
thread_balança = threading.Thread(target=ler_dados_balança)
thread_balança.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
