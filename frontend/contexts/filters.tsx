import { createContext, useState } from "react";

// Crear un contexto para los filtros
export const FiltersContext = createContext();

// Crear el provider, para proveer el contexto a los componentes

export function FiltersProvider({ children }) {

    const[filters, setFilters] = useState({
        category: 'all',
        minPrice: 0
    })

    return (
        <FiltersContext.Provider value={{ 
            filters, 
            setFilters
        }}>
            {children}
        </FiltersContext.Provider>
    )
}