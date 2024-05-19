import { CarouselComponents } from './components/carousel';
import { ConfigPanel } from './components/config_panel';
import {
  DashboardState,
  dashboard,
  base,
  IDataRange,
} from '@lark-base-open/js-sdk';
import { useEffect, useCallback, useState } from 'react';
import { useStyleConfigStore, useTypeConfigStore } from '@/store';

export interface ITableSource {
  tableId: string;
  tableName: string;
}

const App = () => {
  // 类型与数据
  const { updateTypeConfig } = useTypeConfigStore((state) => state);

  // 样式配置数据
  const { updateStyleConfig } = useStyleConfigStore((state) => state);

  // 表格列表
  const [tableSource, setTableSource] = useState<ITableSource[]>([]);

  // 数据范围列表
  const [dataRange, setDataRange] = useState<IDataRange[]>([]);

  // 列名
  const [categories, setCategories] = useState<any>([]);

  // 数据范围 视图
  const getTableRange = useCallback((tableId: string) => {
    return dashboard.getTableDataRange(tableId);
  }, []);

  // 获取列信息
  const getCategories = (table: any, tableId: string) => {
    return table.getFieldMetaList(tableId);
  };

  // 获取表格列表
  const getTableList = useCallback((tableIdList: any) => {
    return tableIdList.map(async (table: any) => {
      const name = await table.getName();
      return {
        tableName: name,
        tableId: table.id,
      };
    });
  }, []);

  async function initConfigData(id: string | null) {
    console.log('更新表格数据', id);

    const tableIdList = await base.getTableList();
    const tableList = await Promise.all(getTableList(tableIdList));

    const tableId = id ? id : tableList[0].tableId;
    const table = await base.getTable(tableId);

    const [tableRanges, categories] = await Promise.all([
      getTableRange(tableId),
      getCategories(table, tableId),
    ]);

    setDataRange([...tableRanges]);

    setCategories([{ id: 'hidden', name: '隐藏', type: -1 }, ...categories]);

    setTableSource([...tableList]);
    // console.log('tableMeta---->', tableRanges, categories);
  }

  // const switchTheme = (theme: string) => {
  //   const body = document.body;
  //   if (body.hasAttribute('theme-mode')) {
  //     body.removeAttribute('theme-mode');
  //   } else {
  //     body.setAttribute('theme-mode', theme);
  //   }
  // };

  useEffect(() => {
    initConfigData(null);
  }, []);

  useEffect(() => {
    async function getConfig() {
      const config = await dashboard.getConfig();
      const { typeConfig, styleConfig } = config.customConfig as any;
      updateTypeConfig(typeConfig);
      updateStyleConfig(styleConfig);
      initConfigData(typeConfig.tableId);
    }
    getConfig();
    dashboard.onConfigChange(getConfig);
    // dashboard.onDataChange(() => console.log('dataChange'));
  }, []);

  return (
    <div className="flex h-full">
      <CarouselComponents />
      {dashboard.state === DashboardState.Create ||
      dashboard.state === DashboardState.Config
        ? tableSource.length > 0 &&
          dataRange.length > 0 &&
          categories.length > 0 && (
            <ConfigPanel
              tableSource={tableSource}
              dataRange={dataRange}
              categories={categories}
              getTableConfig={initConfigData}
            />
          )
        : null}
    </div>
  );
};

export default App;
