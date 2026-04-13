# ORI_l-Etudiant

Enregistrez et renommez votre clé json dans le dossier `/credentials/letudiant-data-prod-ori-key.json`

Build une image et test d'une premiere requête
```sh
docker build . -t ori && docker run -it --rm ori python index.py 
```