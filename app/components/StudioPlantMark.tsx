type StudioPlantMarkProps = {
  plant: string;
  colour: string;
  name?: string;
  size?: "small" | "large";
  className?: string;
};

export default function StudioPlantMark({
  plant,
  colour,
  name,
  size = "small",
  className = "",
}: StudioPlantMarkProps) {
  const dimensions =
    size === "large"
      ? "h-12 w-12"
      : "h-8 w-8";

  const shapes: Record<
    string,
    React.ReactNode
  > = {
    maple: (
      <>
        <path d="M32 53V29" />
        <path d="M32 35L23 24" />
        <path d="M32 34L42 23" />
        <path d="M23 24L18 17L26 19L25 11L32 18L34 9L37 18L45 13L42 22L50 20L43 28" />
      </>
    ),

    jacaranda: (
      <>
        <path d="M31 53C31 42 32 33 34 25" />
        <path d="M34 31L22 21" />
        <path d="M34 28L45 18" />
        <circle cx="20" cy="19" r="5" />
        <circle cx="29" cy="16" r="6" />
        <circle cx="39" cy="16" r="6" />
        <circle cx="47" cy="20" r="5" />
      </>
    ),

    juniper: (
      <>
        <path d="M29 53C29 42 31 35 36 28C40 22 39 17 37 12" />
        <path d="M35 29C28 28 22 24 17 20" />
        <path d="M38 23C44 22 49 19 52 16" />
        <path d="M17 20C22 16 27 16 31 18" />
        <path d="M42 18C46 14 51 13 54 15" />
      </>
    ),

    pine: (
      <>
        <path d="M31 53C31 42 33 31 32 18" />
        <path d="M32 32L20 25" />
        <path d="M33 26L44 19" />
        <path d="M18 24C24 20 28 20 33 22" />
        <path d="M39 18C45 14 50 14 54 17" />
        <path d="M27 16C32 12 36 13 40 15" />
      </>
    ),

    wisteria: (
      <>
        <path d="M31 53C30 42 32 31 34 21" />
        <path d="M34 26L21 15" />
        <path d="M34 23L48 14" />
        <path d="M21 15C18 24 19 32 22 39" />
        <path d="M48 14C47 23 45 31 42 38" />
        <circle cx="21" cy="27" r="2" />
        <circle cx="22" cy="34" r="2" />
        <circle cx="45" cy="26" r="2" />
        <circle cx="43" cy="33" r="2" />
      </>
    ),
  };

  /*
   * Plants without their own silhouette yet use
   * the quiet broadleaf form.
   */
  const broadleaf = (
    <>
      <path d="M31 53C31 42 31 33 33 23" />
      <path d="M33 31L22 22" />
      <path d="M33 28L43 18" />
      <path d="M17 23C16 16 23 12 29 16C32 10 39 11 42 16C49 13 53 19 49 25C52 31 45 34 41 31C36 35 30 33 28 29C22 33 17 29 17 23Z" />
    </>
  );

return (
  <div
    className={className}
    title={name}
  >
    <svg
      viewBox="0 0 64 64"
      className={dimensions}
      aria-hidden="true"
      style={{ color: colour }}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {shapes[plant] ?? broadleaf}

         {shapes[plant] ?? broadleaf}

        <path d="M22 53H42" />
      </g>
    </svg>
  </div>
  );
}