from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json
import numpy as np
from utils import puxar_dados, puxar_dados_separacao
import pandas as pd
import os

site = FastAPI(title="Dashboard Sincronismo", description="API para controle de separação por setor")


site.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_path = os.path.join(os.path.dirname(__file__), "static")
print(f"Caminho dos arquivos estáticos: {static_path}")
print(f"Pasta static existe: {os.path.exists(static_path)}")
if os.path.exists(static_path):
    site.mount("/static", StaticFiles(directory=static_path), name="static")
    print("Arquivos estáticos montados em /static")
else:
    print("AVISO: Pasta static não encontrada!")

@site.get("/", response_class=HTMLResponse)
async def index():
    """Servir a página principal do dashboard"""
    try:
        html_path = os.path.join(static_path, "index.html")
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as file:
                return HTMLResponse(content=file.read())
        else:
            return HTMLResponse(content="<h1>Dashboard não encontrado</h1><p>Verifique se os arquivos estáticos estão na pasta 'static'</p>")
    except Exception as e:
        return HTMLResponse(content=f"<h1>Erro</h1><p>{str(e)}</p>")

@site.get("/graficos", response_class=HTMLResponse)
async def graficos():
    """Servir a página de gráficos"""
    try:
        html_path = os.path.join(static_path, "graficos.html")
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as file:
                return HTMLResponse(content=file.read())
        else:
            # Fallback para versão simples
            html_path_simples = os.path.join(static_path, "graficos_simples.html")
            if os.path.exists(html_path_simples):
                with open(html_path_simples, "r", encoding="utf-8") as file:
                    return HTMLResponse(content=file.read())
            else:
                return HTMLResponse(content="<h1>Página de Gráficos não encontrada</h1><p>Verifique se o arquivo graficos.html está na pasta 'static'</p>")
    except Exception as e:
        return HTMLResponse(content=f"<h1>Erro</h1><p>{str(e)}</p>")

@site.get("/graficos/simples", response_class=HTMLResponse)
async def graficos_simples():
    """Servir a versão simples da página de gráficos"""
    try:
        html_path = os.path.join(static_path, "graficos_simples.html")
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as file:
                return HTMLResponse(content=file.read())
        else:
            return HTMLResponse(content="<h1>Página de Gráficos Simples não encontrada</h1>")
    except Exception as e:
        return HTMLResponse(content=f"<h1>Erro</h1><p>{str(e)}</p>")

@site.get("/static/{file_path:path}")
async def serve_static_files(file_path: str):
    """Servir arquivos estáticos de forma mais robusta"""
    try:
        full_path = os.path.join(static_path, file_path)
        if os.path.exists(full_path) and os.path.isfile(full_path):
            return FileResponse(full_path)
        else:
            return HTMLResponse(content=f"<h1>Arquivo não encontrado</h1><p>O arquivo {file_path} não existe.</p>", status_code=404)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Erro</h1><p>{str(e)}</p>", status_code=500)

@site.get("/api/dados")
def api_dados():
    """Endpoint para retornar os dados processados em JSON"""
    try:
        print("Iniciando puxar_dados...")
        plat = puxar_dados()
        print(f"Dados recebidos: {len(plat) if not plat.empty else 0} linhas")
        
        if plat.empty:
            print("Nenhum dado encontrado")
            return {"data": [], "message": "Nenhum dado encontrado"}
        
        grafico_1 = plat.copy()
        grafico_1 = grafico_1.pivot_table(
            index=["Setor", "Descrição setor"],
            values=["Linhas Separadas", "Linhas Restantes", "Containers Restantes", "Quantidade Total de Containers", "Peso Previsto", "Quantidade de Itens",
                     "Peso Separado", "Containers Separados", "Itens Separados", "Peso Restante", "Containers Restantes", "Itens Restantes"],
            aggfunc="sum"
        ).reset_index()

        # Definir metas por setor
        metas_por_setor = {
            "10": 59, "11": 76, "12": 112, "13": 84, "14": 93, "15": 82,
            "20": 30, "21": 45, "39": 42, "44": 64, "50": 0, "52": 23,
            "53": 184, "58": 60, "60": 68, 'ARMI-2': 0, 'ARMI-3': 0,
            'ARMFRAC': 0, 'SETOR24': 0
        }
        
        grafico_1["Meta"] = grafico_1["Setor"].map(metas_por_setor).fillna(0)
        
        resultado = {"data": grafico_1.to_dict("records")}
        print(f"Retornando {len(resultado['data'])} registros")
        return resultado
        
    except Exception as e:
        print(f"Erro na API: {str(e)}")
        return {"error": str(e), "message": "Erro ao processar dados"}
    
@site.get("/api/dadosseparacao")
def api_dados_sep():
    """Endpoint para retornar os dados processados em JSON"""
    try:
        print("Iniciando puxar_dados...")
        plat = puxar_dados_separacao()
        print(f"Dados recebidos: {len(plat) if not plat.empty else 0} linhas")
        
        if plat.empty:
            print("Nenhum dado encontrado")
            return {"data": [], "message": "Nenhum dado encontrado"}
        
        tabela = plat.copy()

        
        tabela["Pendência"] = tabela["Pendência"].apply(lambda x: 0 if x == "Nao" else 1)
        tabela["Usuário Alocado"] = tabela["Usuário Alocado"].apply(lambda x: 0 if x == "Não alocado" else 1)
        tabela["containers_unicos"] = tabela.groupby("Container").cumcount().apply(lambda x: 1 if x == 0 else 0)
        
        grafico_2 = tabela.pivot_table(
            index=["Onda", "Carga", "Stage", "Área Separação"],
            values=["Container", "Pendência", "Usuário Alocado", "containers_unicos"],
                aggfunc={
        "Container":"count",
        "Pendência":"sum",
        "Usuário Alocado":"sum",
        "containers_unicos":"sum",
    }
        ).reset_index()


        
        resultado_sep = {
            "sep_data": grafico_2.to_dict("records"),
            "tabela_data": tabela.to_dict("records"),
        }


        return resultado_sep
    
        
    except Exception as e:
        print(f"Erro na API: {str(e)}")
        return {"error": str(e), "message": "Erro ao processar dados"}

@site.get("/Separação", response_class=HTMLResponse)
async def projeto1():
    """Servir a página do Projeto 1 - Separação"""
    try:
        html_path = os.path.join(static_path, "Separação", "index.html")
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as file:
                return HTMLResponse(content=file.read())
        else:
            return HTMLResponse(content="<h1>Projeto Separação não encontrado</h1><p>Verifique se o arquivo index.html está na pasta 'static/Separação'</p>")
    except Exception as e:
        return HTMLResponse(content=f"<h1>Erro</h1><p>{str(e)}</p>")

@site.get("/Pendencia&Corte", response_class=HTMLResponse)
async def projeto2():
    """Servir a página do Projeto 2 - Pendência e Corte"""
    try:
        html_path = os.path.join(static_path, "Pendencia e Corte", "index.html")
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as file:
                return HTMLResponse(content=file.read())
        else:
            return HTMLResponse(content="<h1>Projeto Pendência e Corte não encontrado</h1><p>Verifique se o arquivo index.html está na pasta 'static/Pendencia e Corte'</p>")
    except Exception as e:
        return HTMLResponse(content=f"<h1>Erro</h1><p>{str(e)}</p>")

@site.get("/Carregamento", response_class=HTMLResponse)
async def projeto3():
    """Servir a página do Projeto 3 - Carregamento"""
    try:
        html_path = os.path.join(static_path, "Carregamento", "index.html")
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as file:
                return HTMLResponse(content=file.read())
        else:
            return HTMLResponse(content="<h1>Projeto Carregamento não encontrado</h1><p>Verifique se o arquivo index.html está na pasta 'static/Carregamento'</p>")
    except Exception as e:
        return HTMLResponse(content=f"<h1>Erro</h1><p>{str(e)}</p>")

@site.get("/Hora_Hora", response_class=HTMLResponse)
async def projeto4():
    """Servir a página do Projeto 4 - Hora a Hora"""
    try:
        html_path = os.path.join(static_path, "Hora a Hora", "index.html")
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as file:
                return HTMLResponse(content=file.read())
        else:
            return HTMLResponse(content="<h1>Projeto Hora a Hora não encontrado</h1><p>Verifique se o arquivo index.html está na pasta 'static/Hora a Hora'</p>")
    except Exception as e:
        return HTMLResponse(content=f"<h1>Erro</h1><p>{str(e)}</p>")

@site.get("/Configurações", response_class=HTMLResponse)
async def projeto5():
    """Servir a página do Projeto 5 - Configurações"""
    try:
        html_path = os.path.join(static_path, "Configurações", "index.html")
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as file:
                return HTMLResponse(content=file.read())
        else:
            return HTMLResponse(content="<h1>Projeto Configurações não encontrado</h1><p>Verifique se o arquivo index.html está na pasta 'static/Configurações'</p>")
    except Exception as e:
        return HTMLResponse(content=f"<h1>Erro</h1><p>{str(e)}</p>")

@site.get("/health")
def health_check():
    """Endpoint para verificar se o servidor está funcionando"""
    return {"status": "ok", "message": "Servidor funcionando corretamente"}


if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor na porta 8000...")
    uvicorn.run(site, host="0.0.0.0", port=8000)

