// const fs = require('fs');
// const express = require('express');
// const { ApolloServer, UserInputError } = require('apollo-server-express');
// const { GraphQLScalarType } = require('graphql');
import { GraphQLScalarType } from 'graphql';
// const { Kind } = require('graphql/language');
// const { MongoClient } = require('mongodb');
import { MongoClient } from 'mongodb';

let aboutMessage = "return aboutMessage()";

// ===== MongoDB ===========

const url = 'mongodb+srv://issuetracker_user:2erllKuWsYj8e5Rr@cluster0.qxehy0z.mongodb.net/issue_tracker?retryWrites=true&w=majority';

// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';
//
// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';

let db;

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}



// ===== GraphQL ===========

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

const resolvers = {
  Query: {
    about: () => aboutMessage,
    issueList,
  },
  Mutation: {
    setAboutMessage,
    issueAdd,
  },
  GraphQLDate,
};

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
}

async function issueList() {
  const issues = await db.collection('issues').find({}).toArray();
  return issues;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

function issueValidate(issue) {
  const errors = [];
  if (issue.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }
  if (issue.status === 'Assigned' && !issue.owner) {
    errors.push('Field "owner" is required when status is "Assigned"');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function issueAdd(_, { issue }) {
  issueValidate(issue);
  issue.created = new Date();
  issue.id = await getNextSequence('issues');

  const result = await db.collection('issues').insertOne(issue);
  const savedIssue = await db.collection('issues')
    .findOne({ _id: result.insertedId });
  return savedIssue;
}


// ===== Server ===========
/*
const server = new ApolloServer({
  typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => { console.log(error); return error; },
});

const app = express();

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try { //     await connectToDb();
    app.listen(3000, function ()  { console.log('API server started on port 3000'); });
  } catch (err)                   { console.log('ERROR:', err); }
})();
*/

// ===== Server-new ===========

import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import express from 'express';
import http from 'http';

import path from 'path';
import { readFileSync } from 'fs';

async function startApolloServer(app, httpServer) {

  try {
      await connectToDb();

      const server = new ApolloServer({
          typeDefs: readFileSync( path.join(process.cwd(), 'api' , 'schema.graphql') , 'utf8'),
          resolvers,
          csrfPrevention: true,
          cache: 'bounded',
          plugins: [  ApolloServerPluginDrainHttpServer         ( {httpServer} ),
                      ApolloServerPluginLandingPageLocalDefault ( {embed: true} ),
          ],
      });
      await server.start();
      server.applyMiddleware({app});
    //await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
      await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));
      console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  } catch (err)                   { console.log('ERROR:', err); }
}


const app = express();
const httpServer = http.createServer(app);
startApolloServer(app, httpServer);


export default httpServer;
