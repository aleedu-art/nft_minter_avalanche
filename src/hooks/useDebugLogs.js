import { useState, useCallback } from 'react';

export const useDebugLogs = () => {
  const [logs, setLogs] = useState(['Sistema inicializado. Aguardando ações...']);

  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    
    setLogs(prev => [...prev, logEntry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs(['Debug logs limpos.']);
  }, []);

  const exportLogs = useCallback(() => {
    const logsText = logs.join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nft-analyzer-logs-${new Date().toISOString().slice(0,19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  return {
    logs,
    addLog,
    clearLogs,
    exportLogs
  };
};

