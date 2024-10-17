# from fastapi import FastAPI, Request, Form, Depends
# from fastapi.templating import Jinja2Templates
# from fastapi.responses import JSONResponse, RedirectResponse
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
# from sqlalchemy.orm import sessionmaker, declarative_base, relationship
# from datetime import datetime
# import serial
# import time
# import threading

# # Configurações da porta serial
# porta_serial = 'COM9'
# baudrate = 9600
# bits_de_dados = 8
# paridade = serial.PARITY_NONE
# bits_de_parada = serial.STOPBITS_ONE
# tamanho_leitura = 7

# ultimo_dado_balança = None
# executando = True

# app = FastAPI()

# origins = ["http://localhost:3000"]
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Inicializa os templates do Jinja2
# templates = Jinja2Templates(directory="templates")

# # Configuração do SQLAlchemy
# DATABASE_URL = "sqlite:///./food_data.db"  # Usando SQLite como exemplo
# engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# # Modelos de tabela
# class Food(Base):
#     __tablename__ = "foods"
    
#     food_id = Column(Integer, primary_key=True, index=True)
#     food_name = Column(String, unique=True, index=True)
#     price = Column(Float)

# class FoodReading(Base):
#     __tablename__ = "food_readings"
    
#     id = Column(Integer, primary_key=True, index=True)
#     food_id = Column(Integer, ForeignKey("foods.food_id"))
#     weight = Column(Float)
#     date = Column(DateTime, default=datetime.utcnow)

#     food = relationship("Food")

# # Criar as tabelas no banco de dados
# Base.metadata.create_all(bind=engine)

# # Pydantic model for receiving POST data
# class FoodItem(BaseModel):
#     foodId: int
#     foodName: str
#     foodPrice: float

# # Função para obter sessão do banco de dados
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # Rota para exibir o formulário e a tabela
# @app.get("/")
# async def get_form(request: Request, db: SessionLocal = Depends(get_db)):
#     foods = db.query(Food).all()
#     food_readings = db.query(FoodReading).all()
#     return templates.TemplateResponse("index.html", {"request": request, "foods": foods, "food_readings": food_readings})

# # Rota para processar o envio do formulário e salvar na base de dados
# @app.post("/submit_form")
# async def submit_form(name: str = Form(...), db: SessionLocal = Depends(get_db)):
#     if ultimo_dado_balança is not None:
#         reading = int(ultimo_dado_balança) / 100
#     else:
#         reading = "deu ruim"

#     # Adicionar comida no banco de dados (se não existir)
#     food = db.query(Food).filter(Food.food_name == name).first()
#     if not food:
#         food = Food(food_name=name, price=0.0)  # Preço fictício para teste
#         db.add(food)
#         db.commit()
#         db.refresh(food)

#     # Adicionar leitura na tabela FoodReading
#     new_reading = FoodReading(food_id=food.food_id, weight=reading)
#     db.add(new_reading)
#     db.commit()

#     # Redireciona de volta para a página inicial
#     return RedirectResponse(url="/", status_code=303)

# # Rota para processar o POST via API e salvar na base de dados
# @app.post("/submit")
# async def submit_form(food_item: FoodItem, db: SessionLocal = Depends(get_db)):
#     print(food_item)
#     food_id = food_item.foodId
#     food_name = food_item.foodName
#     food_price = food_item.foodPrice

#     if ultimo_dado_balança is not None:
#         reading = int(ultimo_dado_balança) / 100
#     else:
#         reading = 10.52

#     # Verifica se o item de comida já existe, senão cria
#     food = db.query(Food).filter(Food.food_id == food_id).first()
#     if not food:
#         food = Food(food_id=food_id, food_name=food_name, price=food_price)
#         db.add(food)
#         db.commit()
#         db.refresh(food)
    
#     # Adiciona a leitura de peso
#     new_reading = FoodReading(food_id=food.food_id, weight=reading)
#     print(new_reading.weight)
#     db.add(new_reading)
#     db.commit()

#     return RedirectResponse(url="/", status_code=200)

# # Função para ler dados da balança
# def ler_dados_balança():
#     global ultimo_dado_balança, executando
#     try:
#         ser = serial.Serial(
#             porta_serial,
#             baudrate,
#             bytesize=bits_de_dados,
#             parity=paridade,
#             stopbits=bits_de_parada,
#             timeout=1
#         )

#         print(f"Conectado à balança na porta {porta_serial}")

#         while executando:
#             try:
#                 dados_brutos = ser.read(tamanho_leitura)
#                 if len(dados_brutos) > 0:
#                     dados_filtrados = dados_brutos.replace(b'\x02', b'').replace(b'\x03', b'')
#                     try:
#                         dados_decodificados = dados_filtrados.decode('utf-8').strip()
#                         ultimo_dado_balança = dados_decodificados
#                     except UnicodeDecodeError:
#                         print("Erro ao decodificar os dados.")
#             except serial.SerialException as e:
#                 print(f"Erro de comunicação: {e}")
#                 break

#     except serial.SerialException as e:
#         print(f"Erro ao conectar à porta serial: {e}")
#     finally:
#         if ser.is_open:
#             ser.close()
#             print(f"Porta {porta_serial} fechada.")

# # Inicia a thread para leitura da balança
# thread_balança = threading.Thread(target=ler_dados_balança)
# thread_balança.start()

# if __name__ == "__main__":
#     import uvicorn
#     ler_dados_balança()
#     uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)


from fastapi import FastAPI, Request, Form, Depends
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
trigger_event = threading.Event()  # Cria um evento


# Configurações da porta serial
porta_serial = 'COM9'
baudrate = 9600
bits_de_dados = 8
paridade = serial.PARITY_NONE
bits_de_parada = serial.STOPBITS_ONE
tamanho_leitura = 7

ultimo_dado_balança = None
executando = True
ler_dados_da_balanca = False  # Inicializa como False

app = FastAPI()

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializa os templates do Jinja2
templates = Jinja2Templates(directory="templates")

# Configuração do SQLAlchemy
DATABASE_URL = "sqlite:///./food_data.db"  # Usando SQLite como exemplo
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

# Criar as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# Pydantic model for receiving POST data
class FoodItem(BaseModel):
    foodId: int
    foodName: str
    foodPrice: float

# Função para obter sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Rota para exibir o formulário e a tabela
@app.get("/")
async def get_form(request: Request, db: SessionLocal = Depends(get_db)):
    foods = db.query(Food).all()
    food_readings = db.query(FoodReading).all()
    return templates.TemplateResponse("index.html", {"request": request, "foods": foods, "food_readings": food_readings})

# Rota para processar o envio do formulário e salvar na base de dados
@app.post("/submit_form")
async def submit_form(name: str = Form(...), db: SessionLocal = Depends(get_db)):
    trigger_event.set()
    if ultimo_dado_balança is not None:
        reading = int(ultimo_dado_balança) / 100
    else:
        reading = "deu ruim"

    # Adicionar comida no banco de dados (se não existir)
    food = db.query(Food).filter(Food.food_name == name).first()
    if not food:
        food = Food(food_name=name, price=0.0)  # Preço fictício para teste
        db.add(food)
        db.commit()
        db.refresh(food)

    # Adicionar leitura na tabela FoodReading
    new_reading = FoodReading(food_id=food.food_id, weight=reading)
    db.add(new_reading)
    db.commit()

    # Redireciona de volta para a página inicial
    return RedirectResponse(url="/", status_code=303)

# Rota para processar o POST via API e salvar na base de dados
@app.post("/submit")
async def submit_form(food_item: FoodItem, db: SessionLocal = Depends(get_db)):
    trigger_event.set()
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
    
    # Adiciona a leitura de peso
    new_reading = FoodReading(food_id=food.food_id, weight=reading)
    print(new_reading.weight)
    db.add(new_reading)
    db.commit()

    return RedirectResponse(url="/", status_code=200)

# Função para obter dados de resumo
@app.get("/food-waste/summary")
async def get_summary(db: SessionLocal = Depends(get_db)):
    total_weight = db.query(func.sum(FoodReading.weight)).scalar() or 0
    total_value = db.query(func.sum(FoodReading.weight * Food.price)).join(Food).scalar() or 0
    total_transactions = db.query(FoodReading).count()
    
    print(total_weight, total_value, total_transactions)
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

    print(labels, data)
    
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

        print(f"Conectado à balança na porta {porta_serial}")

        while executando:
            # Aguarda até que o evento seja definido
            trigger_event.wait()  # A thread aguarda o evento

            # Reseta o evento para que não seja acionado novamente
            trigger_event.clear()
            try:
                ser.write(b'\x05')  # Envia o caractere ENQ
                time.sleep(0.5)
                print("Caractere ENQ enviado para a balança.")
                dados_brutos = ser.read(tamanho_leitura)
                if len(dados_brutos) > 0:
                    print("entroua aqui")   
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
            print(f"Porta {porta_serial} fechada.")

# Inicia a thread para leitura da balança
thread_balança = threading.Thread(target=ler_dados_balança)
thread_balança.start()
# thread_balança.join()
if __name__ == "__main__":
    import uvicorn
    # ler_dados_balança()
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
