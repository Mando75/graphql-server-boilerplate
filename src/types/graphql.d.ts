// tslint:disable
// graphql typescript definitions

declare namespace GQL {
  interface IGraphQLResponseRoot {
    data?: IQuery | IMutation;
    errors?: Array<IGraphQLResponseError>;
  }

  interface IGraphQLResponseError {
    /** Required for all errors */
    message: string;
    locations?: Array<IGraphQLResponseErrorLocation>;
    /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
    [propName: string]: any;
  }

  interface IGraphQLResponseErrorLocation {
    line: number;
    column: number;
  }

  interface IQuery {
    __typename: "Query";
    books: Array<IBook | null> | null;
    me: IMe | null;
  }

  interface IBooksOnQueryArguments {
    title?: string | null;
    author?: string | null;
  }

  interface IBook {
    __typename: "Book";
    title: string | null;
    author: string | null;
  }

  interface IMe {
    __typename: "Me";
    id: string;
    email: string;
  }

  interface IMutation {
    __typename: "Mutation";
    _empty: boolean | null;
    registerUser: Array<IGraphQLError> | null;
    login: Array<IGraphQLError> | null;
    logout: boolean | null;
  }

  interface IRegisterUserOnMutationArguments {
    user?: IUserRegistrationType | null;
  }

  interface ILoginOnMutationArguments {
    user?: IUserLoginType | null;
  }

  interface IUserRegistrationType {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }

  interface IGraphQLError {
    __typename: "GraphQLError";
    path: string;
    message: string;
  }

  interface IUserLoginType {
    email: string;
    password: string;
  }
}

// tslint:enable
