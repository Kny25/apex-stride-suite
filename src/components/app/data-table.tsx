import { useMemo, useState } from "react";
import { ArrowUpDown, MoreHorizontal, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./page-header";
import { toast } from "sonner";

export type Column<T> = {
  key: keyof T & string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isStatus?: boolean;
};

export function DataTable<T extends { id: string }>({
  data, columns, searchKeys = [],
}: {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let rows = data;
    if (query && searchKeys.length) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => searchKeys.some((k) => String(r[k]).toLowerCase().includes(q)));
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = String(a[sortKey as keyof T]); const bv = String(b[sortKey as keyof T]);
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return rows;
  }, [data, query, sortKey, sortAsc, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-2xl border border-border bg-card-premium shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Buscar..."
            className="w-full h-10 rounded-lg bg-muted/40 border border-border pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="outline" size="sm">Filtros</Button>
        <Button variant="outline" size="sm">Exportar</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {columns.map((c) => (
                <th key={c.key} className="text-left font-medium text-muted-foreground px-4 py-3">
                  <button
                    className="inline-flex items-center gap-1.5 hover:text-foreground transition"
                    onClick={() => {
                      if (sortKey === c.key) setSortAsc(!sortAsc);
                      else { setSortKey(c.key); setSortAsc(true); }
                    }}
                  >
                    {c.label}
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </button>
                </th>
              ))}
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className="border-b border-border/60 hover:bg-muted/20 transition">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    {c.render ? c.render(row) : c.isStatus
                      ? <StatusBadge status={String(row[c.key as keyof T])} />
                      : <span>{String(row[c.key as keyof T])}</span>}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.success("Visualizando " + row.id)}>
                        <Eye className="h-4 w-4 mr-2" />Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Editando " + row.id)}>
                        <Pencil className="h-4 w-4 mr-2" />Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => toast.error("Removido " + row.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">Nenhum resultado encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border text-sm">
        <span className="text-muted-foreground">
          {filtered.length} resultado{filtered.length !== 1 && "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
          <span className="text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
        </div>
      </div>
    </div>
  );
}
