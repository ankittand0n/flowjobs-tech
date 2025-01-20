import { createBrowserRouter } from "react-router";

import { ArtboardPage } from "../pages/artboard";
import { BuilderLayout } from "../pages/builder";
import { PreviewLayout } from "../pages/preview";
import { Providers } from "../providers";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Providers />,
    children: [
      {
        path: "artboard",
        element: <ArtboardPage />,
        children: [
          {
            path: "builder",
            element: <BuilderLayout />
          },
          {
            path: "preview",
            element: <PreviewLayout />
          }
        ]
      }
    ]
  }
]);
