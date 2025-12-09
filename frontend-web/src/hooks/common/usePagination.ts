import { useState, useCallback } from 'react';

/**
 * Hook para manejar estado de paginación
 * 
 * @param initialPage - Página inicial (default: 0)
 * @param pageSize - Tamaño de página (default: 10)
 * @returns Estado y handlers de paginación
 * 
 * @example
 * const { page, pageSize, handleChangePage, handleChangePageSize } = usePagination();
 */
export function usePagination(initialPage = 0, pageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangePageSize = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  return {
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangePageSize,
  };
}
