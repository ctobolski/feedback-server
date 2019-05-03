require('dotenv').config()
import Koa from 'koa'
import { ApolloServer, gql } from 'apollo-server-koa'
import cors from '@koa/cors'
//TODO: env var
const port = process.env.port || 8080

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
 input FeedbackInput {
    reaction: String
    message: String
  }
  type Feedback {
    id: ID!,
    reaction: String,
    message: String
  }
  type Mutation {
    createFeedback(input: FeedbackInput): Feedback
  }
  type Query {
      feedback: [Feedback]
  }
`;
interface Feedback {
    reaction: string,
    message: string
}

interface Store {
    [id: string]: Feedback
}
function repo() {
    const cache: Store = {}
    let id = 0
    return {
        save: function (feedback: Feedback) {
            cache[id++] = feedback
            return feedback
        },
        get: function () { return Object.keys(cache).map(k => cache[k]) }
    }
}
const db = repo()
const resolvers = {
    Mutation: {
        createFeedback: (parent: any, { input }: { input: Feedback }) => {
            return db.save(input)
        }
    },
    Query: {
        feedback: () => db.get()
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers
})
const app = new Koa()
server.applyMiddleware({ app, path: '/graphql' })
app.use(cors())
app.listen({ port }, () => {
    console.log(`Listening on port: ${port}`)
})

