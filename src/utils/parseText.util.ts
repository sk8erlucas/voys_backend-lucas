export const extractNumber = (input: string): string | null => {
    if (!input) return null;
    const regex = /(\d+)/; // Expresión regular para encontrar el primer grupo de números
    const match = input.match(regex);
    return match ? match[1] : null; // Retorna el primer grupo de números encontrado
}
