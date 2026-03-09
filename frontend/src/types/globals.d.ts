/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
  }
  
  // Для простого импорта CSS (side-effect import)
  declare module '*.css' {
    const styles: any;
    export default styles;
  }