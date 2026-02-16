import pandas as pd
import os

def puxar_dados(diretorio="Dados"):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    full_path = os.path.join(script_dir, diretorio)
    
    excel_files = [
        os.path.join(full_path, f) for f in os.listdir(full_path)
        if f.startswith('Sincronismo') and f.endswith(('.xlsx', '.xls'))]
    if not excel_files:
        return pd.DataFrame()
    dataframes = []
    for file_path in excel_files:
        df = pd.read_excel(file_path, header=0, skiprows=[0])
        dataframes.append(df)
    
    sincro = pd.concat(dataframes, axis=0, ignore_index=True)

    sincro = sincro[["Setor", "Descrição setor", "Peso Prev.", "Peso Sep.", "Peso a separar", "Qtd. Cont.", "Containers a Separar", "Qtd. Linhas", "Qtd. Linhas Sep.", "Qtd. Linhas Restantes", "Qtd. Itens", "Qtd. Itens Sep", "Qtd. Itens Rest"]]
    sincro = sincro.rename(columns={
        "Peso Prev.": "Peso Previsto",
        "Peso Sep.": "Peso Separado",
        "Peso a separar": "Peso Restante",

        "Qtd. Cont.": "Quantidade Total de Containers",
        "Containers a Separar": "Containers Restantes",

        "Qtd. Linhas": "Quantidade de Linhas",
        "Qtd. Linhas Sep.": "Linhas Separadas",
        "Qtd. Linhas Restantes": "Linhas Restantes",

        "Qtd. Itens": "Quantidade de Itens",
        "Qtd. Itens Sep": "Itens Separados",
        "Qtd. Itens Rest": "Itens Restantes"
    })

    sincro["Containers Separados"] = sincro["Quantidade Total de Containers"] - sincro["Containers Restantes"]

    float_columns = ["Peso Previsto", "Peso Separado", "Peso Restante", "Linhas Separadas", "Linhas Restantes",
                     "Itens Restantes", "Itens Separados"]
    for col in float_columns:
        sincro[col] = sincro[col].astype(str).str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    sincro = sincro.astype({
        "Setor": "str",
        "Descrição setor": "str", 
        "Quantidade Total de Containers": "int",
        "Containers Restantes": "int",
        "Containers Separados": "int",
        "Quantidade de Linhas": "int",
        "Quantidade de Itens": "int"
    })

    sincro["Itens Restantes"] = sincro["Quantidade de Itens"] - sincro["Itens Separados"]

    sincro = sincro.sort_values("Setor")

    return sincro


def puxar_dados_separacao(diretorio="Dados"):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    full_path = os.path.join(script_dir, diretorio)
    
    excel_files = [
        os.path.join(full_path, f) for f in os.listdir(full_path)
        if f.startswith('Detalhes_Se') and f.endswith(('.xlsx', '.xls'))]
    if not excel_files:
        return pd.DataFrame()
    dataframes = []
    for file_path in excel_files:
        df = pd.read_excel(file_path)
        dataframes.append(df)
    separacao = pd.concat(dataframes, axis=0, ignore_index=True)

    list_sep = ["Onda", "Carga", "Stage", "Container", "Item", "Descrição", "Endereço Separação", "Qtd. Ped.",
                "Área Sep.", "Pend.", "Status", "Usuário Alocado"]
    separacao = separacao[list_sep]
    separacao = separacao.rename(columns={
        "Qtd. Ped.": "Quantidade Pedida",
        "Área Sep.": "Área Separação",
        "Pend.": "Pendência",
    })

    separacao["Usuário Alocado"] = separacao["Usuário Alocado"].fillna("Não alocado")
    separacao["Container"] = separacao["Container"].fillna("PL Fechado")

    float_columns = ["Quantidade Pedida"]
    for col in float_columns:
        separacao[col] = separacao[col].astype(str).str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    separacao = separacao.astype({
        "Onda": "str",
        "Carga": "str",
        "Stage": "str",
        "Container": "str",
        "Item": "str",
        "Descrição": "str",
        "Endereço Separação": "str",
        "Área Separação": "str",
        "Pendência": "str",
        "Usuário Alocado": "str"
    })

    return separacao
