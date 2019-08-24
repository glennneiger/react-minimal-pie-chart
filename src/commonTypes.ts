export declare type StyleObject = {
  [key: string]: string | number;
};

export type Data = {
  title?: string | number;
  color: string;
  value: number;
  key?: string | number;
  style?: StyleObject;
  [key: string]: any;
}[];
