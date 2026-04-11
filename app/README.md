Enregistrez et renommez votre clé json dans le dossier `/credentials/letudiant-data-prod-albert-key.json`

Build une image et test d'une premiere requête
```sh
docker build . -t albert && docker run -it --rm albert python index.py 
```
