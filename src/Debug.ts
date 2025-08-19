import { GUI } from "lil-gui";

export class Debug {
  private static instance: Debug;
  public gui: GUI;

  private constructor() {
    this.gui = new GUI({ width: 400 });
  }

  public static getInstance(): Debug {
    if (!Debug.instance) {
      Debug.instance = new Debug();
    }
    return Debug.instance;
  }

  public addFolder(name: string): GUI {
    return this.gui.addFolder(name);
  }

  public add(
    object: any,
    property: string,
    min?: number,
    max?: number,
    step?: number
  ): any {
    return this.gui.add(object, property, min, max, step);
  }

  public addColor(object: any, property: string): any {
    return this.gui.addColor(object, property);
  }

  public destroy(): void {
    this.gui.destroy();
    Debug.instance = null as any;
  }

  public show(): void {
    this.gui.show();
  }

  public hide(): void {
    this.gui.hide();
  }
}

export const debug = Debug.getInstance();
