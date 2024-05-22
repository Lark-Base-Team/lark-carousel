import { create } from 'zustand';

export interface ITypeConfigType {
  tableId: string;
  rowRange: string;
  title: string;
  secTitle: string;
  backGround: string;
  rowLength: number;
  theme: 'light' | 'dark' | 'primary';
  control: Array<'indicator' | 'arrow'>;
  update: string;
}

interface ITypeConfigStore {
  typeConfig: ITypeConfigType;
  updateTypeConfig: (typeConfig: ITypeConfigStore) => void;
}

export const useTypeConfigStore = create<ITypeConfigStore>((set) => ({
  typeConfig: {
    tableId: '',
    rowRange: '',
    title: 'hidden',
    secTitle: 'hidden',
    backGround: 'hidden',
    rowLength: 3,
    theme: 'dark',
    control: ['indicator', 'arrow'],
    update: 'update'
  },
  updateTypeConfig: (typeConfig) => set(() => ({ typeConfig }))
}));


export interface IStyleConfigType {
  title: {
    width: number;
    fontSize: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    fontWeight: boolean;
    fontStyle:  boolean;
    textUnderline: boolean;
    lineThrough: boolean;
  },
  secTitle: {
    width: number;
    fontSize: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    fontWeight: boolean;
    fontStyle:  boolean;
    textUnderline: boolean;
    lineThrough: boolean;
  },
  background: {
    opacity: number;
    color: string;
  },
  indicator: {
    type: 'dot' | 'line' | 'columnar',
    position: 'left' | 'center' | 'right',
  },
  arrow: {
    type: 'always' | 'hover',
  },
  transition: {
    animation: 'fade' | 'slide',
    speed: number
  }
}

interface IStyleConfigStore {
  styleConfig: IStyleConfigType;
  updateStyleConfig: (styleConfig: IStyleConfigType) => void;
}

export const useStyleConfigStore = create<IStyleConfigStore>((set) => ({
  styleConfig: {
    title: {
      width: 90,
      fontSize: '34',
      textAlign: 'center',
      color: '#000000',
      fontWeight: true,
      fontStyle:  false,
      textUnderline: false,
      lineThrough: false,
    },
    secTitle: {
      width: 90,
      fontSize: '16',
      textAlign: 'center',
      color: '#000000',
      fontWeight: false,
      fontStyle:  false,
      textUnderline: false,
      lineThrough: false,
    },
    background: {
      opacity: 90,
      color: 'rgba(255, 255, 255, 1)',
    },
    indicator: {
      type: 'dot',
      position: 'center',
    },
    arrow: {
      type: 'always',
    },
    transition: {
      animation: 'slide',
      speed: 800,
    },
  },
  updateStyleConfig: (styleConfig: IStyleConfigType) => set(() => ({ styleConfig }))
}));
