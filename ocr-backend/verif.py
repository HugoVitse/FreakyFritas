import pandas as pd
import openai
import os
from dotenv import load_dotenv

load_dotenv()


# --- Configuration ---
excel_file = 'Data/source_sans_doublons.xlsx'
filtre_dest = 'BASE LOGISTIQUE'

# --- Chargement des feuilles de référence ---
df_pays = pd.read_excel(excel_file, sheet_name='Pays')
df_calibre = pd.read_excel(excel_file, sheet_name='Calibre')
df_categorie = pd.read_excel(excel_file, sheet_name='Catégorie')
df_traitement = pd.read_excel(excel_file, sheet_name='Traitement')
df_mentions = pd.read_excel(excel_file, sheet_name='Mentions')

# --- Chargement et Filtrage (Normalisation_occurrences) ---
df_norm_occ = pd.read_excel(excel_file, sheet_name='Normalisation_occurrences')
# Nettoyage des espaces et filtrage
df_norm_occ['DESTINATION'] = df_norm_occ['DESTINATION'].astype(str).str.strip()
df_norm_occ = df_norm_occ[df_norm_occ['DESTINATION'] == filtre_dest].copy()
# Nettoyage de la colonne FAMILLE pour éviter les doublons d'espaces
df_norm_occ['FAMILLE'] = df_norm_occ['FAMILLE'].astype(str).str.strip()


# Formatage du résultat pour utilisation directe dans votre code



# --- CONFIGURATION API ---
api_key = os.getenv('OPENAI_API_KEY')
client = openai.OpenAI(api_key=api_key)



# --- Fonction principale ---
def determiner_famille_sous_famille(info, dictionnaire):
    # Transformation du dictionnaire en texte pour le prompt
    liste_familles = ", ".join([f"{k}: {v}" for k, v in dictionnaire.items()])
    
    prompt = f"""
    Tu es un expert en logistique de produits frais.

    RÈGLES STRICTES (À RESPECTER DANS L’ORDRE) :
    1. Vérifie si le produit correspond directement à l’une des combinaisons FAMILLE | SOUS-FAMILLE.
       - Si oui, choisis cette combinaison directement. (en favorisant la SOUS-FAMILLE)
    2. Si aucune correspondance exacte n’existe, alors cherche la combinaison la plus proche par rapprochement sémantique.
    3. Une FAMILLE et une SOUS-FAMILLE sont TOUJOURS liées et proviennent de la MÊME ligne.
    4. Ne mélange jamais la FAMILLE d’une ligne avec la SOUS-FAMILLE d’une autre ligne.
    5. Si plusieurs combinaisons sont possibles, choisis TOUJOURS la PLUS SPÉCIFIQUE.
    6. N’utilise une combinaison générique que si aucune plus précise ne correspond.
    7. N’invente jamais de FAMILLE ou de SOUS-FAMILLE.

    PRODUIT :
    - Nom : {info['product_name']}
    - Variété : {info['variety']}

    COMBINAISONS AUTORISÉES (ID : FAMILLE | SOUS-FAMILLE) :
    [{liste_familles}]

    QUESTION :
    Quelle est la combinaison FAMILLE / SOUS-FAMILLE la plus proche de ce produit ?

    RÉPONSE :
    Réponds UNIQUEMENT avec l’ID numérique correspondant.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Tu es un assistant qui répond uniquement par des IDs numériques."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        
        # --- Récupération de l'ID renvoyé par GPT ---
        id_trouve = int(response.choices[0].message.content.strip())
        
        # --- Transformation en "FAMILLE | SOUS-FAMILLE" ---
        combinaison_trouvee = dictionnaire.get(id_trouve)
        if combinaison_trouvee:
            famille, sous_famille = map(str.strip, combinaison_trouvee.split("|"))
            return famille, sous_famille
        else:
            return None, None
        
    except Exception as e:
        print(f"Erreur lors de l'appel API : {e}")
        return None, None




# # Filtrer df_norm_occ pour la famille et sous-famille identifiées
# df_norm_occ_filtree = df_norm_occ[
#     (df_norm_occ['FAMILLE'].str.strip() == resultat_famille) &
#     (df_norm_occ['SOUS-FAMILLE'] == resultat_sous_famille)
# ]

def champs_reglementaires_excel(df_norm_occ_filtree):
    # Liste des colonnes à tester
    colonnes_a_tester = [
        "Couleur",
        "CODE CALIBRE",
        "CODE CATEGORIE",
        "CODE TRAITEMENT CHIMIQUE",
        "MENTIONS complementaires"
    ]

    colonnes_reglementaires = []

    if not df_norm_occ_filtree.empty:
        # On prend la première ligne correspondante
        ligne = df_norm_occ_filtree.iloc[0]
        for col in colonnes_a_tester:
            if col in df_norm_occ_filtree.columns:
                valeur = ligne[col]
                if pd.notna(valeur) and str(valeur).strip() != "":
        
                    colonnes_reglementaires.append(col)
    return colonnes_reglementaires


def calibre_reglemntaire(product_info,df_calibre,df_norm_occ_filtree):
    Erreur = []
    
    calibre = product_info.get("calibre")

    if calibre :

        return Erreur

    else:
        
        return Erreur.append("Calibre manquant")
    

def verif_calibre(product_info, df_calibre_filtre):

    # Sécurité : si pas de règles calibre
    if df_calibre_filtre is None or df_calibre_filtre.empty:
        return "NON REGLEMENTAIRE"

    # Transformation du dataframe en texte lisible pour le prompt
    regles_calibre = df_calibre_filtre.to_dict(orient="records")

    prompt = f"""
Tu es un expert en réglementation des fruits et légumes.

DONNÉES PRODUIT :
- Calibre : {product_info.get('calibre')}

RÈGLES DE RÉFÉRENCE (DataFrame) :
{regles_calibre}

CONSIGNE :
Compare le calibre du produit avec les règles fournies. 

Réponds uniquement par :
REGLEMENTAIRE
ou
NON REGLEMENTAIRE
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un assistant qui répond uniquement par REGLEMENTAIRE ou NON REGLEMENTAIRE."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        resultat = response.choices[0].message.content.strip().upper()

        if resultat in ["REGLEMENTAIRE", "NON REGLEMENTAIRE"]:
            return resultat
        else:
            print("Réponse inattendue :", resultat)
            return "NON REGLEMENTAIRE"

    except Exception as e:
        print(f"Erreur lors de l'appel API calibre : {e}")
        return "NON REGLEMENTAIRE"



# i = calibre_reglemntaire(product_info,colonnes_reglementaires,df_calibre,df_norm_occ_filtree)
# print("Résultat final de la vérification du calibre :", i)

def traitement_reglemntaire(product_info,df_traitement,df_norm_occ_filtree):
    Erreur = []

    # Récupérer la valeur de la colonne "CODE CALIBRE"
    if not df_norm_occ_filtree.empty:
        code_traitement = df_norm_occ_filtree['CODE TRAITEMENT CHIMIQUE'].iloc[0]
        
        # Vérifier que code_traitement n'est pas vide
        if pd.notna(code_traitement) and str(code_traitement).strip() != "":
            # Filtrer df_traitement
            df_traitement_filtre = df_traitement[
                df_traitement['ID Traitement'] == code_traitement
            ]
            if not df_traitement_filtre.empty:
                resultat_traitement = verif_traitement(product_info, df_traitement_filtre)
                #print("Résultat vérification traitement :", resultat_traitement)
                if resultat_traitement == "REGLEMENTAIRE":
                    return []
                else :
                    Erreur.append("Traitement non réglementaire")
                    return Erreur
            else:
                #print("Aucune ligne trouvée dans df_traitement pour ce code traitement")
                Erreur.append("Traitement ID non trouvé dans les règles")
                return Erreur

        else:
            #print("CODE TRAITEMENT CHIMIQUE vide ou invalide")
            Erreur.append("CODE TRAITEMENT CHIMIQUE vide ou invalide")
            return Erreur
     

    else:
        #print("Aucune ligne trouvée pour cette famille / sous-famille")
        Erreur.append("Traitement : Aucune ligne trouvée pour cette famille / sous-famille")
        return Erreur
    

def verif_traitement(product_info, df_traitement_filtre):

    # Sécurité : si pas de règles de traitement
    if df_traitement_filtre is None or df_traitement_filtre.empty:
        return "NON REGLEMENTAIRE"

    # Transformation du dataframe en texte lisible pour le prompt
    regles_traitement = df_traitement_filtre.to_dict(orient="records")

    prompt = f"""
Tu es un moteur de validation STRICT.

RÈGLE IMPORTANTE :
- Si le traitement du produit correspond au type de traitement mentionné dans les règles
  (ex : anti-germinatif ≈ traité contre la germination),
  ALORS répondre REGLEMENTAIRE.
- NE PAS tenir compte des substances chimiques implicites.
- NE PAS faire d’interprétation ou de déduction.
- Comparaison uniquement sémantique du TYPE de traitement.

DONNÉES PRODUIT :
- Traitement chimique : {product_info.get('post_product_treatement')}

RÈGLES DE RÉFÉRENCE :
{regles_traitement}

Réponds uniquement par :
REGLEMENTAIRE
ou
NON REGLEMENTAIRE
"""


    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un assistant qui répond uniquement par REGLEMENTAIRE ou NON REGLEMENTAIRE."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        resultat = response.choices[0].message.content.strip().upper()

        if resultat in ["REGLEMENTAIRE", "NON REGLEMENTAIRE"]:
            return resultat
        else:
            print("Réponse inattendue :", resultat)
            return "NON REGLEMENTAIRE"

    except Exception as e:
        print(f"Erreur lors de l'appel API traitement chimique : {e}")
        return "NON REGLEMENTAIRE"



def mentions_reglementaire(product_info,df_mentions,df_norm_occ_filtree):
    Erreur = []

    # Récupérer la valeur de la colonne "CODE CALIBRE"
    if not df_norm_occ_filtree.empty:
        code_mention = df_norm_occ_filtree['MENTIONS complementaires'].iloc[0]
        
        # Vérifier que code_mention n'est pas vide
        if pd.notna(code_mention) and str(code_mention).strip() != "":
            # Filtrer df_mentions
            df_mentions_filtre = df_mentions[
                df_mentions['ID mentions'] == code_mention
            ]
            if not df_mentions_filtre.empty:
                resultat_mentions = verif_mentions(product_info, df_mentions_filtre)
                if resultat_mentions == "REGLEMENTAIRE":
                    return []
                else :
                    Erreur.append("Mentions non réglementaire")
                    return Erreur
            else:
                Erreur.append("Mentions ID non trouvé dans les règles")
                return Erreur

        else:
            Erreur.append("MENTIONS COMPLEMENTAIRES vide ou invalide")
            return Erreur
     

    else:
        Erreur.append("Mentions : Aucune ligne trouvée pour cette famille / sous-famille")
        return Erreur
    

def verif_mentions(product_info, df_mentions_filtre):

    # Sécurité : si pas de règles de mentions
    if df_mentions_filtre is None or df_mentions_filtre.empty:
        return "NON REGLEMENTAIRE"

    # Transformation du dataframe en texte lisible pour le prompt
    regles_mentions = df_mentions_filtre.to_dict(orient="records")

    prompt = f"""
Tu es un expert en réglementation des fruits et légumes.

DONNÉES PRODUIT :
- Mentions présentes sur le produit : {product_info.get('additionals_informations')}

RÈGLES DE RÉFÉRENCE (DataFrame) :
{regles_mentions}

CONSIGNE :
Vérifie si les mentions du produit sont conformes aux règles fournies
(mentions obligatoires présentes, mentions interdites absentes).

Réponds uniquement par :
REGLEMENTAIRE
ou
NON REGLEMENTAIRE
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un assistant qui répond uniquement par REGLEMENTAIRE ou NON REGLEMENTAIRE."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        resultat = response.choices[0].message.content.strip().upper()

        if resultat in ["REGLEMENTAIRE", "NON REGLEMENTAIRE"]:
            return resultat
        else:
            print("Réponse inattendue :", resultat)
            return "NON REGLEMENTAIRE"

    except Exception as e:
        print(f"Erreur lors de l'appel API mentions : {e}")
        return "NON REGLEMENTAIRE"


def categorie_reglementaire(product_info, df_categorie, df_norm_occ_filtree):
    Erreur = []

    # Récupérer la valeur de la colonne "CODE CATEGORIE"
    if not df_norm_occ_filtree.empty:
        code_categorie = df_norm_occ_filtree['CODE CATEGORIE'].iloc[0]
        #print("Code catégorie :", code_categorie)

        # Vérifier que code_categorie n'est pas vide
        if pd.notna(code_categorie) and str(code_categorie).strip() != "":
            # Filtrer df_categorie
            df_categorie_filtre = df_categorie[
                df_categorie['ID categorie'] == code_categorie
            ]

            if not df_categorie_filtre.empty:
                resultat_categorie = verif_categorie(product_info, df_categorie_filtre)
                #print("Résultat vérification catégorie :", resultat_categorie)

                if resultat_categorie == "REGLEMENTAIRE":
                    return Erreur
                else :
                    Erreur.append("Catégorie non réglementaire")
                    return Erreur
            else:
                #print("Aucune ligne trouvée dans df_categorie pour ce code catégorie")
                Erreur.append("Catégorie ID non trouvé dans les règles")
                return Erreur   

        else:
            #print("CODE CATEGORIE vide ou invalide")
            Erreur.append("CODE CATEGORIE vide ou invalide")
            return Erreur

    else:
        #print("Aucune ligne trouvée pour cette famille / sous-famille")
        Erreur.append("Catégorie : Aucune ligne trouvée pour cette famille / sous-famille")
        return Erreur


def verif_categorie(product_info, df_categorie_filtre):
    # Création du dictionnaire pour Catégorie
    categorie_unique = df_categorie_filtre['Code Categorie'].dropna().unique()
    dict_categorie = {i: valeur for i, valeur in enumerate(categorie_unique)}
    categorie = product_info["category"]

    if categorie.lower() in [valeur.lower() for valeur in dict_categorie.values()]:
        return "REGLEMENTAIRE"
    else:
        return "NON REGLEMENTAIRE"


# Verif
# Identité de l’emballeur/expéditeur 


def identite_emballeur_reglementaire(product_info,df_pays):
    Erreur = []
    # Récupération des informations nécessaires
    nom_adresse = product_info.get("packer_name_address")
    iso_code = product_info.get("packer_iso_code")
    packed_for_name_address = product_info.get("packed_for_name_address")
    packed_for_packer_code = product_info.get("packed_for_packer_code")

    if (nom_adresse or iso_code or (packed_for_name_address and packed_for_packer_code)):
        # Ce code s'exécute si au moins une variable n'est ni None, ni vide
        # print("Action : Au moins une donnée emballeur est remplie.")

        # Manque à vérif : Nom et adresse complète (rue, ville, pays) et Mention Emballé pour nom et adresse du vendeur + code emballeur

        # Vérification du code ISO
        if iso_code :
            statut_iso = verif_code_iso(iso_code, df_pays)
            #print(f"Statut du code ISO ({iso_code}) : {statut_iso}")
            if statut_iso == "NON REGLEMENTAIRE":
                Erreur.append("Code ISO emballeur non réglementaire")
                return Erreur
            
        return Erreur

    else:
        #print("Action : Aucune donnée emballeur trouvée.")
        return Erreur.append("Données emballeur manquantes ou vides")

    

def verif_code_iso(code_iso,df_pays):

    # Extraction des valeurs uniques et suppression des doublons/NaN pour chaque colonne
    iso_num_unique = df_pays['Code ISO Numérique'].dropna().unique()
    iso_2_unique = df_pays['Code ISO 2'].dropna().unique()
    iso_3_unique = df_pays['Code ISO 3'].dropna().unique()

    # Création des 3 dictionnaires (Index : Valeur)
    dict_iso_num = {i: valeur for i, valeur in enumerate(iso_num_unique)}
    dict_iso_2 = {i: valeur for i, valeur in enumerate(iso_2_unique)}
    dict_iso_3 = {i: valeur for i, valeur in enumerate(iso_3_unique)}

    if code_iso in dict_iso_num.values() or code_iso in dict_iso_2.values() or code_iso in dict_iso_3.values():
        return "REGLEMENTAIRE"
    else:
        return "NON REGLEMENTAIRE"


    
    

def tracabilite_reglementaire(product_info):
    Erreur = []
    # Récupération des informations nécessaires
    tracabilte_code = product_info.get("traceability_code")
    lots = product_info.get("lots")
    datage_code = product_info.get("datage_code")

    if tracabilte_code or lots or datage_code:

        # ajout vérif code traçabilité et lots
        return Erreur
    
    Erreur.append("Données traçabilité manquantes ou vides")
    return Erreur
    
    

def verif_generale(product_info):
    Erreur_local = []

    product_name = product_info.get("product_name")
    variety = product_info.get("variety")
    
    if not product_name or str(product_name).strip() == "":
        Erreur_local.append("Nom du produit manquant ou vide")
    
    if not variety or str(variety).strip() == "":
        Erreur_local.append("Variété / Type commercial manquant ou vide")
    return Erreur_local

def origine_reglementaire(product_info):
    Erreur = []
    origin = product_info.get("origin")

    if origin and str(origin).strip() != "":
        return Erreur
    else:
        Erreur.append("Origine manquante ou vide")
        return Erreur


def verif(product_info):  #df_norm_occ,df_calibre,df_categorie,df_pays

    global df_norm_occ
    global df_calibre
    global df_categorie
    global df_pays


    Erreur = []

    # Mention « destiné à la transformation » ou « au don »
    Mention_intended_use = product_info.get("intended_use")
    if Mention_intended_use is not None and Mention_intended_use != "":
        return Erreur
    
    # Vérification de la présence de nom du produit, variété / Type commercial
    Erreur = verif_generale(product_info)

    if Erreur:
        return Erreur
    
    # Vérification de l'origine
    Erreur.extend(origine_reglementaire(product_info) or [])

    # Matching Famille et Sous-Famille avec le Excel
    # Création du dataframe filtré sans doublons pour FAMILLE et SOUS-FAMILLE
    df_norm_occ_filtree_1 = (
        df_norm_occ[["FAMILLE", "SOUS-FAMILLE"]]
        .drop_duplicates()
        .reset_index(drop=True)
    )

    # Création du dictionnaire ID : "FAMILLE | SOUS-FAMILLE"
    dict_famille = {i+1: f"{row.FAMILLE} | {row['SOUS-FAMILLE']}" for i, row in df_norm_occ_filtree_1.iterrows()}

    resultat_famille, resultat_sous_famille = determiner_famille_sous_famille(product_info, dict_famille)

    # Filtrer df_norm_occ pour la famille et sous-famille identifiées
    df_norm_occ_filtree = df_norm_occ[
    (df_norm_occ["FAMILLE"].astype(str).str.strip() == resultat_famille.strip()) &
    (df_norm_occ["SOUS-FAMILLE"].astype(str).str.strip() == resultat_sous_famille.strip())
    ]

    # Trouver champs réglementaires dans le excel
    colonnes_reglementaires = champs_reglementaires_excel(df_norm_occ_filtree)
    
    


    # Vérifcation v2
    Calibre = product_info.get("calibre")
    Categorie = product_info.get("category")
    Traitement = product_info.get("post_product_treatement")
    Mentions = product_info.get("additionals_informations")


    if colonnes_reglementaires:
        # Vérification calibre
        if Calibre is not None and Calibre != "":
            if "CODE CALIBRE" in colonnes_reglementaires:
                Erreur.extend(calibre_reglemntaire(product_info,df_calibre,df_norm_occ_filtree) or [])
        else:
            Erreur.append("Calibre manquant ou vide")

        # Vérification traitement chimique
        if Traitement is not None and Traitement != "":
            if "CODE TRAITEMENT CHIMIQUE" in colonnes_reglementaires:
                Erreur.extend(traitement_reglemntaire(product_info,df_traitement,df_norm_occ_filtree) or [])
        
        # Vérification mentions
        # if Mentions is not None and Mentions != "":
        #     if "MENTIONS complementaires" in colonnes_reglementaires:
        #         Erreur.extend(mentions_reglementaire(product_info,df_mentions,df_norm_occ_filtree) or [])


        # Vérification catégorie
        if Categorie is not None and Categorie != "":
            if "CODE CATEGORIE" in colonnes_reglementaires:
                Erreur.extend(categorie_reglementaire(product_info,df_categorie,df_norm_occ_filtree) or [])
        else:
            Erreur.append("Catégorie manquante ou vide")


    # Vérification identité emballeur/expéditeur
    Erreur.extend(identite_emballeur_reglementaire(product_info,df_pays) or [])


    # Vérification traçabilité
    Erreur.extend(tracabilite_reglementaire(product_info) or [])
    
    return Erreur


# v = verif(product_info,df_norm_occ,df_calibre,df_categorie,df_pays)
# print("Liste des erreurs détectées :", v)
