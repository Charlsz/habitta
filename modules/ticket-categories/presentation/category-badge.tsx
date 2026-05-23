interface Props {
  name:  string;
  color: string;
}

/** Badge inline de categoría de ticket */
export function CategoryBadge({ name, color }: Props) {
  // Derivar un color de fondo claro del hex de la categoría
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {name}
    </span>
  );
}
