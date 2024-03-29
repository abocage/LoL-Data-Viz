# Framework de visualisation de données avec Docker

- Vérifier qu'un transfert de port est actif entre 8080 sur la machine hôte et 80 sur la machine virtuelle
- Récupérer le code à https://ecampus.unicaen.fr/mod/url/view.php?id=523785 et le mettre sur la machine virtuelle.

        scp -P 2222 docker-framework.tgz infodec@127.0.0.1:

## Installation

- construire le container `graphql` :

        $ cd graphql
        $ rm -fr node_modules/
        $ docker build -t graphql .

- démarrer la pile de containers graphql/mongo

        $ cd ..
        $ docker-compose -f stack.yml up -d

- accéder à l'application : ouvrir la page `127.0.0.1:8080/index.html` avec le navigateur de la machine hôte

## Axes de développement

Le projet que vous avez à réaliser pour valider ce module consiste à 

* trouver des données dans un thème qui vous intéresse
* mettre ces données dans la base MongoDB
* réaliser une interface de visualisation des données grâce à la pile de containers.

L'exemple de code fourni doit vous inspirer pour la structure générale de l'application. Vous devez donc spécialiser :

* les données
* les requêtes
* les pages de la visualisation.

### Un premier axe concerne le développement des requêtes `graphQL`.

- éteindre la pile de containers
- désactiver le container `graphQL` de la pile Docker en commentant les lignes du service correspondant dans le fichier `stack.yml` à l'aide de caractères #
- il faut maintenant lancer le service `graphQL` directement sur la machine hôte. Dans le résolveur, modifier l'URL de connexion à MongoDB :

        const url = 'mongodb://root:example@127.0.0.1:27017';

- effectuer le développement des requêtes en modifiant le schéma, les résolveurs et en utilisant le *playground* de `graphQL` (mettre à `true` la variable `playground` dans le `index.js` du serveur `graphQL`)

- lorsque le développement du connecteur `graphQL` est stable, modifier l'adresse IP du container `Mongo` dans le résolveur :

        const url = 'mongodb://root:example@mongodb:27017';

- puis construisez le container :

        $ docker build -t graphql .

- vous pouvez maintenant l'intégrer à la pile

### Le deuxième axe concerne le développement des pages .HTML

Vous pouvez utiliser `D3.js` pour effectuer la visualisation des données obtenues par `graphQL` :

        d3.json("http://localhost:4000/?query={artists(mini:50){artist artistname count}}").then(drawArtists)

Il est fortement conseillé de ne pas rentrer dans du développement en D3.js, donc la courbe d'apprentissage est particulièrement abrupte. Préférez donc choisir une visualisation qui vous plaît [dans la gallerie](https://observablehq.com/@d3/gallery) et qui utilise des données similaires aux vôtres (tabulaires, graphiques, etc.) et adaptez cette visualisation à vos propres données.

## Ressources

- un bon cours sur D3.js : <http://using-d3js.com/index.html>
- de nombreux tutoriel du D3.js : <https://www.tutorialspoint.com/d3js/index.htm>

## Constitution des données

- on démarre depuis une extraction des titres de <https://musicbrainz.org/doc/MusicBrainz_Database> qui contiennent le mot `opus`
- on transforme les données pour obtenir les éléments suivants :
```
    {
      "artist": 879067,
      "artistname": "sergei prokofiev",
      "track": 12239831,
      "title": "piano concerto",
      "instrument": "piano",
      "numero": 3,
      "tonality": "c",
      "mode": "major",
      "opus": 26,
      "part": 3,
      "indication": "allegro ma non troppo"
    },
```

- on insère ces données dans le container `Mongo` :

        jq -c .titles[] titlesWithInstrument.json | grep tonality | docker exec -i docker-framework_mongo_1 sh -c 'mongoimport -d clasik -c titles --authenticationDatabase admin -u root -p example'

- créer la collection des artistes
```
db.titles.aggregate([
    {
        $group:{
            _id:{
                artist:"$artist", 
                artistname:"$artistname"
            },
            count:{
                $sum: 1
            }
        }
    }, 
    {
        $project:{
            artist:"$_id.artist", 
            artistname:"$_id.artistname",
            count:1,
            _id:0
        }
    },
    {
        $out:"artists"
    }
])
```
- créer la collection des tonalités :
```
db.titles.aggregate([
    {
        $group:{
            _id:{
                tonality:"$tonality", 
                mode:"$mode"
            },
            count:{
                $sum: 1
            }
        }
    }, 
    {
        $project:{
            tonality:"$_id.tonality", 
            mode:"$_id.mode",
            count:1,
            _id:0
        }
    },
    {
        $out:"tonalities"
    }
])
```
- créer la collection des instruments :
```
db.titles.aggregate([
    {
        $group:{
            _id:{
                instrument:"$instrument"
            },
            count:{
                $sum: 1
            }
        }
    }, 
    {
        $project:{
            instrument:"$_id.instrument",
            count:1,
            _id:0
        }
    },
    {
        $out:"instruments"
    }
])
