import React from "react";
import { useListAuditLogs, getListAuditLogsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function AuditLogs() {
  const { data: logs, isLoading } = useListAuditLogs(
    { limit: 100 },
    { query: { queryKey: getListAuditLogsQueryKey({ limit: 100 }) } }
  );

  const getActionBadge = (action: string) => {
    switch(action) {
      case "TOPUP": return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">TOPUP</Badge>;
      case "BAN": return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">BAN</Badge>;
      case "UNBAN": return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">UNBAN</Badge>;
      case "PRODUCT_CREATE": return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">PRODUCT</Badge>;
      case "ADD_KEYS": return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">KEYS</Badge>;
      case "BROADCAST": return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">BROADCAST</Badge>;
      case "SETTINGS_UPDATE": return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">SETTINGS</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : logs?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">No audit logs found</TableCell></TableRow>
            ) : (
              logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.id}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(log.createdAt)}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="text-sm">
                    {log.entity}
                    {log.entityId && <span className="ml-1 text-muted-foreground font-mono">({log.entityId})</span>}
                  </TableCell>
                  <TableCell className="text-xs font-mono max-w-[300px] truncate text-muted-foreground">
                    {log.details ? JSON.stringify(log.details) : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
