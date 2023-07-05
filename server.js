const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const graphqlHTTP = require('express-graphql');
const graphqlTools = require('graphql-tools');

let db = null;
const url = 'mongodb://localhost:27017';
const dbName = 'GraphQLdb';
const door = 3000;

MongoClient.connect(url, {useNewUrlParser: true}, function(error, client) {
    if(error) console.log('ERRO de conexão', error);
    else console.log('banco de dados conectado com sucesso. ');

    db = client.db(dbName);
});

app.listen(door);
console.log(`servidor rodando em: localhost: ${door}`);

function getCode(){
    try{
        const data = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const milliseconds = date.getMillisecunds();
        const values = year+''+month+''+day+''+hours+''+minutes+''+seconds+''+milliseconds;
        const result = number(parseFloat(Number(values/2)).toFixed(0))
        return result;
    }catch(error){
        console.log({erro: error});
        return 0;
    }
}

const typeDefs = `
    type Pessoa  {
        _id: ID,
        codigo: Float,
        nome: String,
        idade: int,
        email: String
    }

    input inputPessoa{
        codigo: Float,
        nome: String,
        idade: int,
        email: String
    }

    type Query{
        resposta: String,
        saudacao(nome: String!): String,
        findPesssoaOne(codigo: Float): Pessoa,
        findPessoa(input: inputPessoa): [Pessoa];
    }

    type Mutation {
        insertPessoa(input: inputPessoa): Pesssoa,
        updatePessoa(codigo: Float, input: inputPessoa): String,
        deletePessoa(codigo: float): String
    }
`;

const resolvers = {
    Query: {
        resposta: function() { 
            return 'GraphQl conectado com sucesso.';
        },
        saudacao: function(_, args){
            return `Olá ${args.nome}, seja bem vindo!`;
        },
        findPessoaOne: function(_, {codigo}){            
            return db.collection('pessoas').findOne({codigo: codigo}).then(function(result){
                return result;
            });
        },
        findPessoa: function(_, {input}){            
            return db.collection('pessoas').find(input).toArray.then(function(result){
                return result;
            })

        }
    },
    Mutation: {
        insertPessoa: function(_, {input}){
            input.codigo = getCode();
            return db.collection('pessoas').insertOne(input).then(function(result){
                return result.ops[0];
            });
        },
        updatePessoa: function(_, args){
            return db.collection('pessoas').updateOne({codigo:  args.codigo}, {$set: args.input})
            .then(function(result){
                if(result.result.n>0) return 'Registro EDITADO com sucesso.';
                else return 'Erro na edição';
            });
        },
        deletePessoa: function(_, {codigo}){
            return db.collection('pessoas').deleteOne({codigo: codigo}).then(function(result){
                if(result.result.n>0) return 'Registro DELETADO com sucesso.';
                else return 'Erro na deleção';               
            });
        }
        
    }
}

const schema = graphqlTools.makeExecutableSchema({
    typeDefs:  typeDefs,
    resolvers: resolvers
});

app.use('/graphql', graphqlHTTP({
    graphql: true,
    schema: schema
}))