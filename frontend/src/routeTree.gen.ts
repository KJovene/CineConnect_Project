import { Route as rootRouteImport } from "./routes/__root";
import { Route as SignupRouteImport } from "./routes/signup";
import { Route as LoginRouteImport } from "./routes/login";
import { Route as AuthenticatedRouteImport } from "./routes/_authenticated";
import { Route as AuthenticatedIndexRouteImport } from "./routes/_authenticated/index";
import { Route as AuthenticatedSearchRouteImport } from "./routes/_authenticated/search";
import { Route as AuthenticatedProfilRouteImport } from "./routes/_authenticated/profil";
import { Route as AuthenticatedFilmRouteImport } from "./routes/_authenticated/film";
import { Route as AuthenticatedDiscussionRouteImport } from "./routes/_authenticated/discussion";
import { Route as AuthenticatedFilmIdRouteImport } from "./routes/_authenticated/film.$id";
import { Route as AuthenticatedFilmCategoryCategoryIdRouteImport } from "./routes/_authenticated/film.category.$categoryId";

const SignupRoute = SignupRouteImport.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => rootRouteImport,
} as Parameters<typeof SignupRouteImport.update>[0]);
const LoginRoute = LoginRouteImport.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => rootRouteImport,
} as Parameters<typeof LoginRouteImport.update>[0]);
const AuthenticatedRoute = AuthenticatedRouteImport.update({
  id: "/_authenticated",
  getParentRoute: () => rootRouteImport,
} as Parameters<typeof AuthenticatedRouteImport.update>[0]);
const AuthenticatedIndexRoute = AuthenticatedIndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => AuthenticatedRoute,
} as Parameters<typeof AuthenticatedIndexRouteImport.update>[0]);
const AuthenticatedSearchRoute = AuthenticatedSearchRouteImport.update({
  id: "/search",
  path: "/search",
  getParentRoute: () => AuthenticatedRoute,
} as Parameters<typeof AuthenticatedSearchRouteImport.update>[0]);
const AuthenticatedProfilRoute = AuthenticatedProfilRouteImport.update({
  id: "/profil",
  path: "/profil",
  getParentRoute: () => AuthenticatedRoute,
} as Parameters<typeof AuthenticatedProfilRouteImport.update>[0]);
const AuthenticatedFilmRoute = AuthenticatedFilmRouteImport.update({
  id: "/film",
  path: "/film",
  getParentRoute: () => AuthenticatedRoute,
} as Parameters<typeof AuthenticatedFilmRouteImport.update>[0]);
const AuthenticatedDiscussionRoute = AuthenticatedDiscussionRouteImport.update({
  id: "/discussion",
  path: "/discussion",
  getParentRoute: () => AuthenticatedRoute,
} as Parameters<typeof AuthenticatedDiscussionRouteImport.update>[0]);
const AuthenticatedFilmIdRoute = AuthenticatedFilmIdRouteImport.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => AuthenticatedFilmRoute,
} as Parameters<typeof AuthenticatedFilmIdRouteImport.update>[0]);
const AuthenticatedFilmCategoryCategoryIdRoute =
  AuthenticatedFilmCategoryCategoryIdRouteImport.update({
    id: "/category/$categoryId",
    path: "/category/$categoryId",
    getParentRoute: () => AuthenticatedFilmRoute,
  } as Parameters<
    typeof AuthenticatedFilmCategoryCategoryIdRouteImport.update
  >[0]);

export interface FileRoutesByFullPath {
  "/login": typeof LoginRoute;
  "/signup": typeof SignupRoute;
  "/discussion": typeof AuthenticatedDiscussionRoute;
  "/film": typeof AuthenticatedFilmRouteWithChildren;
  "/profil": typeof AuthenticatedProfilRoute;
  "/search": typeof AuthenticatedSearchRoute;
  "/": typeof AuthenticatedIndexRoute;
  "/film/$id": typeof AuthenticatedFilmIdRoute;
  "/film/category/$categoryId": typeof AuthenticatedFilmCategoryCategoryIdRoute;
}
export interface FileRoutesByTo {
  "/login": typeof LoginRoute;
  "/signup": typeof SignupRoute;
  "/discussion": typeof AuthenticatedDiscussionRoute;
  "/film": typeof AuthenticatedFilmRouteWithChildren;
  "/profil": typeof AuthenticatedProfilRoute;
  "/search": typeof AuthenticatedSearchRoute;
  "/": typeof AuthenticatedIndexRoute;
  "/film/$id": typeof AuthenticatedFilmIdRoute;
  "/film/category/$categoryId": typeof AuthenticatedFilmCategoryCategoryIdRoute;
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport;
  "/_authenticated": typeof AuthenticatedRouteWithChildren;
  "/login": typeof LoginRoute;
  "/signup": typeof SignupRoute;
  "/_authenticated/discussion": typeof AuthenticatedDiscussionRoute;
  "/_authenticated/film": typeof AuthenticatedFilmRouteWithChildren;
  "/_authenticated/profil": typeof AuthenticatedProfilRoute;
  "/_authenticated/search": typeof AuthenticatedSearchRoute;
  "/_authenticated/": typeof AuthenticatedIndexRoute;
  "/_authenticated/film/$id": typeof AuthenticatedFilmIdRoute;
  "/_authenticated/film/category/$categoryId": typeof AuthenticatedFilmCategoryCategoryIdRoute;
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | "/login"
    | "/signup"
    | "/discussion"
    | "/film"
    | "/profil"
    | "/search"
    | "/"
    | "/film/$id"
    | "/film/category/$categoryId";
  fileRoutesByTo: FileRoutesByTo;
  to:
    | "/login"
    | "/signup"
    | "/discussion"
    | "/film"
    | "/profil"
    | "/search"
    | "/"
    | "/film/$id"
    | "/film/category/$categoryId";
  id:
    | "__root__"
    | "/_authenticated"
    | "/login"
    | "/signup"
    | "/_authenticated/discussion"
    | "/_authenticated/film"
    | "/_authenticated/profil"
    | "/_authenticated/search"
    | "/_authenticated/"
    | "/_authenticated/film/$id"
    | "/_authenticated/film/category/$categoryId";
  fileRoutesById: FileRoutesById;
}
export interface RootRouteChildren {
  AuthenticatedRoute: typeof AuthenticatedRouteWithChildren;
  LoginRoute: typeof LoginRoute;
  SignupRoute: typeof SignupRoute;
}

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/signup": {
      id: "/signup";
      path: "/signup";
      fullPath: "/signup";
      preLoaderRoute: typeof SignupRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/login": {
      id: "/login";
      path: "/login";
      fullPath: "/login";
      preLoaderRoute: typeof LoginRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/_authenticated": {
      id: "/_authenticated";
      path: "";
      fullPath: "";
      preLoaderRoute: typeof AuthenticatedRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/_authenticated/": {
      id: "/_authenticated/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof AuthenticatedIndexRouteImport;
      parentRoute: typeof AuthenticatedRoute;
    };
    "/_authenticated/search": {
      id: "/_authenticated/search";
      path: "/search";
      fullPath: "/search";
      preLoaderRoute: typeof AuthenticatedSearchRouteImport;
      parentRoute: typeof AuthenticatedRoute;
    };
    "/_authenticated/profil": {
      id: "/_authenticated/profil";
      path: "/profil";
      fullPath: "/profil";
      preLoaderRoute: typeof AuthenticatedProfilRouteImport;
      parentRoute: typeof AuthenticatedRoute;
    };
    "/_authenticated/film": {
      id: "/_authenticated/film";
      path: "/film";
      fullPath: "/film";
      preLoaderRoute: typeof AuthenticatedFilmRouteImport;
      parentRoute: typeof AuthenticatedRoute;
    };
    "/_authenticated/discussion": {
      id: "/_authenticated/discussion";
      path: "/discussion";
      fullPath: "/discussion";
      preLoaderRoute: typeof AuthenticatedDiscussionRouteImport;
      parentRoute: typeof AuthenticatedRoute;
    };
    "/_authenticated/film/$id": {
      id: "/_authenticated/film/$id";
      path: "/$id";
      fullPath: "/film/$id";
      preLoaderRoute: typeof AuthenticatedFilmIdRouteImport;
      parentRoute: typeof AuthenticatedFilmRoute;
    };
    "/_authenticated/film/category/$categoryId": {
      id: "/_authenticated/film/category/$categoryId";
      path: "/category/$categoryId";
      fullPath: "/film/category/$categoryId";
      preLoaderRoute: typeof AuthenticatedFilmCategoryCategoryIdRouteImport;
      parentRoute: typeof AuthenticatedFilmRoute;
    };
  }
}

interface AuthenticatedFilmRouteChildren {
  AuthenticatedFilmIdRoute: typeof AuthenticatedFilmIdRoute;
  AuthenticatedFilmCategoryCategoryIdRoute: typeof AuthenticatedFilmCategoryCategoryIdRoute;
}

const AuthenticatedFilmRouteChildren: AuthenticatedFilmRouteChildren = {
  AuthenticatedFilmIdRoute: AuthenticatedFilmIdRoute,
  AuthenticatedFilmCategoryCategoryIdRoute:
    AuthenticatedFilmCategoryCategoryIdRoute,
};

const AuthenticatedFilmRouteWithChildren =
  AuthenticatedFilmRoute._addFileChildren(AuthenticatedFilmRouteChildren);

interface AuthenticatedRouteChildren {
  AuthenticatedDiscussionRoute: typeof AuthenticatedDiscussionRoute;
  AuthenticatedFilmRoute: typeof AuthenticatedFilmRouteWithChildren;
  AuthenticatedProfilRoute: typeof AuthenticatedProfilRoute;
  AuthenticatedSearchRoute: typeof AuthenticatedSearchRoute;
  AuthenticatedIndexRoute: typeof AuthenticatedIndexRoute;
}

const AuthenticatedRouteChildren: AuthenticatedRouteChildren = {
  AuthenticatedDiscussionRoute: AuthenticatedDiscussionRoute,
  AuthenticatedFilmRoute: AuthenticatedFilmRouteWithChildren,
  AuthenticatedProfilRoute: AuthenticatedProfilRoute,
  AuthenticatedSearchRoute: AuthenticatedSearchRoute,
  AuthenticatedIndexRoute: AuthenticatedIndexRoute,
};

const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren,
);

const rootRouteChildren: RootRouteChildren = {
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  LoginRoute: LoginRoute,
  SignupRoute: SignupRoute,
};
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();
