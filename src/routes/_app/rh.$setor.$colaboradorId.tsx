import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/rh/$setor/$colaboradorId")({
  component: () => <Outlet />,
});
