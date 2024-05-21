import { dashboard, bridge, ThemeModeType } from '@lark-base-open/js-sdk';
import { useEffect, useRef } from 'react';
import {
  Tabs,
  TabPane,
  Form,
  Select,
  Slider,
  InputNumber,
  RadioGroup,
  Radio,
  Button,
} from '@douyinfe/semi-ui';
import { SourceType, IDataRange, FieldType } from '@lark-base-open/js-sdk';
import {
  IconAlignLeft,
  IconAlignRight,
  IconAlignCenter,
  IconFont,
  IconChevronDown,
} from '@douyinfe/semi-icons';
import { TextBold, TextItalic, TextUnderline } from '@icon-park/react';
import { useTypeConfigStore, useStyleConfigStore } from '@/store';
import { ITableSource } from '../../App';

import './index.css';

const textAlignIcons = {
  left: <IconAlignLeft />,
  center: <IconAlignCenter />,
  right: <IconAlignRight />,
};

interface IConfigPanelPropsType {
  tableSource: ITableSource[];
  dataRange: IDataRange[];
  categories: any[];
  getTableConfig: (id: string | null) => void;
}

export const ConfigPanel: React.FC<IConfigPanelPropsType> = (props) => {
  const { tableSource, dataRange, categories, getTableConfig } = props;

  // 类型与数据
  const { typeConfig, updateTypeConfig } = useTypeConfigStore((state) => state);

  const formApi = useRef<any>();

  // 样式配置数据
  const { styleConfig, updateStyleConfig } = useStyleConfigStore(
    (state) => state,
  );

  const { Option } = Form.Select;

  // const initValues = useMemo(() => {
  //   return {
  //     tableId: tableSource[0]?.tableId || '',
  //     rowRange: dataRange[0].type || '',
  //     title: 'hidden',
  //     secTitle: 'hidden',
  //     backGround: 'hidden',
  //     rowLength: 3,
  //     theme: 'dark',
  //     control: ['indicator', 'arrow'],
  //   };
  // }, [tableSource, dataRange]);

  const switchTheme = (theme: string) => {
    const body = document.body;
    body.removeAttribute('theme-mode');

    body.setAttribute(
      'theme-mode',
      theme === ThemeModeType.LIGHT ? 'light' : 'dark',
    );
  };

  useEffect(() => {
    async function getConfig() {
      const config = await dashboard.getConfig();
      const { typeConfig, styleConfig } = config.customConfig as any;
      updateTypeConfig(typeConfig);
      updateStyleConfig(styleConfig);
      getTableConfig(typeConfig.tableId);

      const theme = await bridge.getTheme();
      console.log('theme 更改----》', theme);
      switchTheme(theme);

      if (!formApi.current) return;
      // 更新
      formApi.current.setValues(typeConfig);
    }
    // if (dashboard.state === DashboardState.View) {
    //   getConfig();
    // }
    // dashboard.onConfigChange(getConfig);
    getConfig();
  }, []);

  useEffect(() => {
    // 初始化的时候
    if (typeConfig.tableId === '') {
      const initValues = {
        tableId: tableSource[0]?.tableId || '',
        rowRange: 'All',
        title: 'hidden',
        secTitle: 'hidden',
        backGround: 'hidden',
        rowLength: 3,
        theme: 'dark',
        control: ['indicator', 'arrow'],
      };
      if (!formApi.current) return;
      // 更新
      formApi.current.setValues({ ...initValues });
    }
  }, [tableSource, typeConfig.tableId]);

  // 类型与数据表单更改
  const handleFormValueChange = (values: any) => {
    const newConfig = { ...typeConfig, ...values };
    updateTypeConfig({ ...newConfig });
  };

  // 样式数据更改
  const handleChangeStyleConfigData = (filedName: string, value: any) => {
    console.log('样式数据更改----》', filedName, value);
    const newStyleConfigData = {
      ...styleConfig,
      [filedName]: value,
    };
    updateStyleConfig({ ...newStyleConfigData });
  };

  // 保存配置
  const saveConfig = () => {
    dashboard.saveConfig({
      dataConditions: [],
      customConfig: {
        typeConfig,
        styleConfig,
      },
    });
  };

  const colorSelectOption = [
    { label: '', value: '#000000' },
    { label: '', value: '#F54A45' },
  ];

  const renderOptionItem = (renderProps: any) => {
    const {
      disabled,
      selected,
      label,
      value,
      focused,
      className,
      style,
      onMouseEnter,
      onClick,
      empty,
      emptyContent,
      ...rest
    } = renderProps;
    // const optionCls = classNames({
    //   ['custom-option-render']: true,
    //   ['custom-option-render-focused']: focused,
    //   ['custom-option-render-disabled']: disabled,
    //   ['custom-option-render-selected']: selected,
    // });

    // Notice：
    // 1.props传入的style需在wrapper dom上进行消费，否则在虚拟化场景下会无法正常使用
    // 2.选中(selected)、聚焦(focused)、禁用(disabled)等状态的样式需自行加上，你可以从props中获取到相对的boolean值
    // 3.onMouseEnter需在wrapper dom上绑定，否则上下键盘操作时显示会有问题
    return (
      <div
        style={style}
        // className={optionCls}
        onClick={() => onClick()}
        onMouseEnter={(e) => onMouseEnter()}
        className="h-[20px] w-[20px] rounded-[6px]"
      >
        <div
          className="h-[18px] w-[18px] rounded-[6px]"
          style={{ backgroundColor: value }}
        ></div>
      </div>
    );
  };

  const renderSelectedItem = (optionNode: any) => {
    return (
      <div className="w-full">
        <div
          className="h-[18px] w-[18px]"
          style={{ backgroundColor: optionNode.value }}
        ></div>
      </div>
    );
  };

  return (
    <div className="relative flex h-screen w-[350px] flex-col border-l-[1px] border-[#ccc] bg-[--semi-color-bg-0]">
      <div className="relative flex-1">
        {
          <Tabs type="line">
            <TabPane tab="类型与数据" itemKey="1">
              <div
                className="overflow-y-scroll px-[20px] pb-[48px] pt-[20px]"
                style={{
                  height: `calc(100vh - 125px)`,
                }}
              >
                <Form
                  initValues={typeConfig}
                  onValueChange={(values) => handleFormValueChange(values)}
                  getFormApi={(api) => (formApi.current = api)}
                  autoComplete="off"
                >
                  <Form.Select
                    field="tableId"
                    label={{ text: '数据源' }}
                    style={{ width: 300 }}
                    onChange={(selectValue) => {
                      getTableConfig(selectValue as string);
                      const { tableId, ...otherProperties } = typeConfig;
                      console.log(tableId);
                      // 更改表格的时候重置其他的默认数据
                      const newConfig = {
                        ...otherProperties,
                        rowRange: dataRange[0].type || '',
                        title: 'hidden',
                        secTitle: 'hidden',
                        backGround: 'hidden',
                      };
                      // updateTypeConfig({ ...typeConfig, ...newConfig });
                      formApi.current.setValues({ ...newConfig });
                    }}
                    optionList={tableSource.map((source) => ({
                      value: source.tableId,
                      label: source.tableName,
                    }))}
                  />
                  <Form.Select
                    field="rowRange"
                    label={{ text: '数据范围' }}
                    style={{ width: 300 }}
                    remote={true}
                    optionList={dataRange.map((range) => {
                      const { type, viewName, viewId } = range as any;
                      if (type === SourceType.ALL) {
                        return {
                          value: 'All',
                          label: '查看全部',
                        };
                      } else {
                        return {
                          value: viewId,
                          label: viewName,
                        };
                      }
                    })}
                  />
                  <div className="my-[10px] h-[0.5px] w-[300px] bg-[#1F232926]"></div>
                  <Form.Select
                    field="title"
                    label={{ text: '标题' }}
                    style={{ width: 300 }}
                    optionList={categories
                      .filter((category) =>
                        [FieldType.Text, -1].includes(category.type),
                      )
                      .map((category) => {
                        const { id, name } = category;
                        return {
                          value: id,
                          label: name,
                        };
                      })}
                  />

                  <Form.Select
                    field="secTitle"
                    label={{ text: '副标题' }}
                    style={{ width: 300 }}
                    optionList={categories
                      .filter((category) =>
                        [FieldType.Text, -1].includes(category.type),
                      )
                      .map((category) => {
                        const { id, name } = category;
                        return {
                          value: id,
                          label: name,
                        };
                      })}
                  />
                  <Form.Select
                    field="backGround"
                    label={{ text: '背景图' }}
                    style={{ width: 300 }}
                    optionList={categories
                      .filter((category) =>
                        [FieldType.Attachment, -1].includes(category.type),
                      )
                      .map((category) => {
                        const { id, name } = category;
                        return {
                          value: id,
                          label: name,
                        };
                      })}
                  />
                  <Form.InputNumber
                    field="rowLength"
                    label={{ text: '记录数' }}
                    min={1}
                    max={20}
                    style={{ width: 300 }}
                  />
                  <div className="my-[10px] h-[0.5px] w-[300px] bg-[#1F232926]"></div>
                  <Form.Select
                    field="theme"
                    label={{ text: '主题' }}
                    style={{ width: 300 }}
                  >
                    <Option value="light">浅色</Option>
                    <Option value="dark">深色</Option>
                  </Form.Select>
                  <Form.CheckboxGroup
                    field="control"
                    label={{ text: '轮播图选项' }}
                    aria-label="轮播图选项"
                    direction="horizontal"
                  >
                    <Form.Checkbox value="indicator">指示器</Form.Checkbox>
                    <Form.Checkbox value="arrow">箭头</Form.Checkbox>
                  </Form.CheckboxGroup>
                </Form>
              </div>
            </TabPane>
            <TabPane tab="自定义样式" itemKey="2">
              <div
                className="flex flex-col gap-[16px] overflow-y-scroll px-[20px] pb-[48px] pt-[20px]"
                style={{
                  height: `calc(100vh - 125px)`,
                }}
              >
                <div className="flex flex-1 flex-col gap-[12px]">
                  <div>标题</div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">文本格式</div>
                    <div className="--semi-color-bg-1 flex h-[42px] w-[284px] items-center justify-center gap-[8px] rounded-[8px] border-[1px]  border-solid border-[#1F2329]">
                      <Select
                        className="select-list"
                        defaultValue={styleConfig.title.fontSize}
                        style={{
                          width: 40,
                          outline: 0,
                          backgroundColor: 'rgba(var(--semi-color-bg-1))',
                        }}
                        onChange={(value) => {
                          handleChangeStyleConfigData('title', {
                            ...styleConfig.title,
                            fontSize: value,
                          });
                        }}
                      >
                        <Select.Option value="11">11</Select.Option>
                        <Select.Option value="12">14</Select.Option>
                        <Select.Option value="16">16</Select.Option>
                        <Select.Option value="18">18</Select.Option>
                        <Select.Option value="20">20</Select.Option>
                        <Select.Option value="22">22</Select.Option>
                        <Select.Option value="26">26</Select.Option>
                        <Select.Option value="28">28</Select.Option>
                        <Select.Option value="36">36</Select.Option>
                        <Select.Option value="48">48</Select.Option>
                        <Select.Option value="48">56</Select.Option>
                        <Select.Option value="72">72</Select.Option>
                      </Select>
                      <div className="relative h-[26px] w-[38px]">
                        <IconFont
                          size="10"
                          className="absolute left-[1.5px] top-[1px] z-[1]"
                        />
                        <IconChevronDown className="absolute right-[2.5px] top-[6px] z-[1] text-[--semi-color-text-2]" />
                        <input
                          className="absolute left-[0px] top-[-0.5px] z-[1]"
                          type="color"
                          style={{
                            width: 38,
                            height: 26,
                            paddingTop: 14,
                            paddingRight: 19,
                            backgroundColor: 'transparent',
                            zIndex: 10,
                          }}
                          onChange={(e) => {
                            handleChangeStyleConfigData('title', {
                              ...styleConfig.title,
                              color: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <Select
                        className="textAlign select-list"
                        style={{
                          width: 38,
                          outline: 0,
                          backgroundColor: 'rgba(var(--semi-color-bg-1))',
                        }}
                        defaultValue={styleConfig.title.textAlign}
                        prefix={textAlignIcons[styleConfig.title.textAlign]}
                        onChange={(value) => {
                          handleChangeStyleConfigData('title', {
                            ...styleConfig.title,
                            textAlign: value,
                          });
                        }}
                      >
                        <Select.Option value="left">左对齐</Select.Option>
                        <Select.Option value="center">中心对齐</Select.Option>
                        <Select.Option value="right">向右对齐</Select.Option>
                      </Select>
                      <div
                        className="flex w-[26px] justify-center rounded-[3px] px-[3px] py-[3px]"
                        style={{
                          background: styleConfig.title.fontWeight
                            ? 'var(--semi-color-tertiary-light-active)'
                            : '',
                        }}
                        onClick={() => {
                          handleChangeStyleConfigData('title', {
                            ...styleConfig.title,
                            fontWeight: !styleConfig.title.fontWeight,
                          });
                        }}
                      >
                        <TextBold theme="outline" size="16" fill="#333" />
                      </div>
                      <div
                        className="flex w-[26px] justify-center rounded-[3px] px-[3px] py-[3px]"
                        style={{
                          background: styleConfig.title.fontStyle
                            ? 'var(--semi-color-tertiary-light-active)'
                            : '',
                        }}
                        onClick={() => {
                          handleChangeStyleConfigData('title', {
                            ...styleConfig.title,
                            fontStyle: !styleConfig.title.fontStyle,
                          });
                        }}
                      >
                        <TextItalic theme="outline" size="16" fill="#333" />
                      </div>
                      <div
                        className="flex w-[26px] justify-center rounded-[3px] px-[3px] py-[3px]"
                        style={{
                          background: styleConfig.title.textUnderline
                            ? 'var(--semi-color-tertiary-light-active)'
                            : '',
                        }}
                        onClick={() => {
                          handleChangeStyleConfigData('title', {
                            ...styleConfig.title,
                            textUnderline: !styleConfig.title.textUnderline,
                          });
                        }}
                      >
                        <TextUnderline theme="outline" size="16" fill="#333" />
                      </div>
                      <div
                        className="flex w-[26px] justify-center rounded-[3px] px-[3px] py-[3px]"
                        style={{
                          background: styleConfig.title.lineThrough
                            ? 'var(--semi-color-tertiary-light-active)'
                            : '',
                        }}
                        onClick={() => {
                          handleChangeStyleConfigData('title', {
                            ...styleConfig.title,
                            lineThrough: !styleConfig.title.lineThrough,
                          });
                        }}
                      >
                        <TextUnderline theme="outline" size="16" fill="#333" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">宽度</div>
                    <div className="flex items-center justify-start">
                      <div style={{ width: 217, marginRight: 15 }}>
                        <Slider
                          step={1}
                          value={styleConfig.title.width}
                          onChange={(value) => {
                            handleChangeStyleConfigData('title', {
                              ...styleConfig.title,
                              width: value,
                            });
                          }}
                        ></Slider>
                      </div>
                      <InputNumber
                        hideButtons
                        value={styleConfig.title.width}
                        min={0}
                        max={100}
                        className="inputNumber"
                        formatter={(value) => `${value}%`}
                        parser={(value) => value.replace('%', '')}
                        onChange={(value) => {
                          handleChangeStyleConfigData('title', {
                            ...styleConfig.title,
                            width: value,
                          });
                        }}
                        style={{
                          width: 60,
                          backgroundColor: 'rgba(var(--semi-color-bg-1))',
                          outline: 'none',
                          paddingLeft: '0px',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-[12px]">
                  <div>副标题</div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">文本格式</div>
                    <div className="--semi-color-bg-1 flex h-[42px] w-[284px] items-center justify-center gap-[8px] rounded-[8px] border-[1px]  border-solid border-[#1F2329]">
                      <Select
                        className="select-list"
                        defaultValue={styleConfig.secTitle.fontSize}
                        style={{
                          width: 40,
                          outline: 0,
                          backgroundColor: 'rgba(var(--semi-color-bg-1))',
                        }}
                        onChange={(value) => {
                          handleChangeStyleConfigData('secTitle', {
                            ...styleConfig.secTitle,
                            fontSize: value,
                          });
                        }}
                      >
                        <Select.Option value="11">11</Select.Option>
                        <Select.Option value="12">14</Select.Option>
                        <Select.Option value="16">16</Select.Option>
                        <Select.Option value="18">18</Select.Option>
                        <Select.Option value="20">20</Select.Option>
                        <Select.Option value="22">22</Select.Option>
                        <Select.Option value="26">26</Select.Option>
                        <Select.Option value="28">28</Select.Option>
                        <Select.Option value="34">34</Select.Option>
                        <Select.Option value="36">36</Select.Option>
                        <Select.Option value="48">48</Select.Option>
                        <Select.Option value="48">56</Select.Option>
                        <Select.Option value="72">72</Select.Option>
                      </Select>
                      <div className="relative h-[26px] w-[38px]">
                        <IconFont
                          size="10"
                          className="absolute left-[1.5px] top-[1px] z-[1]"
                        />
                        <IconChevronDown className="absolute right-[2.5px] top-[6px] z-[1] text-[--semi-color-text-2]" />
                        <input
                          className="absolute left-[0px] top-[-0.5px] z-[1]"
                          type="color"
                          style={{
                            width: 38,
                            height: 26,
                            paddingTop: 14,
                            paddingRight: 19,
                            backgroundColor: 'transparent',
                            zIndex: 10,
                          }}
                          onChange={(e) => {
                            handleChangeStyleConfigData('secTitle', {
                              ...styleConfig.secTitle,
                              color: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <Select
                        className="textAlign select-list"
                        style={{
                          width: 38,
                          outline: 0,
                          backgroundColor: 'rgba(var(--semi-color-bg-1))',
                        }}
                        defaultValue={styleConfig.secTitle.textAlign}
                        prefix={textAlignIcons[styleConfig.secTitle.textAlign]}
                        onChange={(value) => {
                          handleChangeStyleConfigData('secTitle', {
                            ...styleConfig.secTitle,
                            textAlign: value,
                          });
                        }}
                      >
                        <Select.Option value="left">左对齐</Select.Option>
                        <Select.Option value="center">中心对齐</Select.Option>
                        <Select.Option value="right">向右对齐</Select.Option>
                      </Select>
                      <div
                        className="flex w-[26px] justify-center "
                        style={{
                          background: styleConfig.secTitle.fontWeight
                            ? 'var(--semi-color-tertiary-light-active)'
                            : '',
                        }}
                        onClick={() => {
                          handleChangeStyleConfigData('secTitle', {
                            ...styleConfig.secTitle,
                            fontWeight: !styleConfig.secTitle.fontWeight,
                          });
                        }}
                      >
                        <TextBold theme="outline" size="16" fill="#333" />
                      </div>
                      <div
                        className="flex w-[26px] justify-center rounded-[3px] px-[3px] py-[3px]"
                        style={{
                          background: styleConfig.secTitle.fontStyle
                            ? 'var(--semi-color-tertiary-light-active)'
                            : '',
                        }}
                        onClick={() => {
                          handleChangeStyleConfigData('secTitle', {
                            ...styleConfig.secTitle,
                            fontStyle: !styleConfig.secTitle.fontStyle,
                          });
                        }}
                      >
                        <TextItalic theme="outline" size="16" fill="#333" />
                      </div>
                      <div
                        className="flex w-[26px] justify-center rounded-[3px] px-[3px] py-[3px]"
                        style={{
                          background: styleConfig.secTitle.textUnderline
                            ? 'var(--semi-color-tertiary-light-active)'
                            : '',
                        }}
                        onClick={() => {
                          handleChangeStyleConfigData('secTitle', {
                            ...styleConfig.secTitle,
                            textUnderline: !styleConfig.secTitle.textUnderline,
                          });
                        }}
                      >
                        <TextUnderline theme="outline" size="16" fill="#333" />
                      </div>
                      <div
                        className="flex w-[26px] justify-center rounded-[3px] px-[3px] py-[3px]"
                        style={{
                          background: styleConfig.secTitle.lineThrough
                            ? 'var(--semi-color-tertiary-light-active)'
                            : '',
                        }}
                        onClick={() => {
                          handleChangeStyleConfigData('secTitle', {
                            ...styleConfig.secTitle,
                            lineThrough: !styleConfig.secTitle.lineThrough,
                          });
                        }}
                      >
                        <TextUnderline theme="outline" size="16" fill="#333" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">宽度</div>
                    <div className="flex items-center justify-start">
                      <div style={{ width: 217, marginRight: 15 }}>
                        <Slider
                          step={1}
                          value={styleConfig.secTitle.width}
                          onChange={(value) => {
                            handleChangeStyleConfigData('secTitle', {
                              ...styleConfig.secTitle,
                              width: value,
                            });
                          }}
                        ></Slider>
                      </div>
                      <InputNumber
                        hideButtons
                        value={styleConfig.secTitle.width}
                        min={0}
                        max={100}
                        className="inputNumber"
                        formatter={(value) => `${value}%`}
                        parser={(value) => value.replace('%', '')}
                        onChange={(value) => {
                          handleChangeStyleConfigData('secTitle', {
                            ...styleConfig.secTitle,
                            width: value,
                          });
                        }}
                        style={{
                          width: 60,
                          backgroundColor: 'rgba(var(--semi-color-bg-1))',
                          outline: 'none',
                          paddingLeft: '0px',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-[12px]">
                  <div>背景</div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">图片透明度</div>
                    <div className="flex items-center justify-start">
                      <div style={{ width: 217, marginRight: 15 }}>
                        <Slider
                          step={1}
                          value={styleConfig.background.opacity}
                          onChange={(value) => {
                            handleChangeStyleConfigData('background', {
                              ...styleConfig.background,
                              opacity: value,
                            });
                          }}
                        ></Slider>
                      </div>
                      <InputNumber
                        hideButtons
                        value={styleConfig.background.opacity}
                        min={0}
                        max={100}
                        className="inputNumber"
                        formatter={(value) => `${value}%`}
                        parser={(value) => value.replace('%', '')}
                        onChange={(value) => {
                          handleChangeStyleConfigData('background', {
                            ...styleConfig.background,
                            opacity: value,
                          });
                        }}
                        style={{
                          width: 60,
                          backgroundColor: 'rgba(var(--semi-color-bg-1))',
                          outline: 'none',
                          paddingLeft: '0px',
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      图片背景颜色
                    </div>
                    <Select
                      style={{
                        width: 290,
                        outline: 0,
                      }}
                      defaultValue={styleConfig.background.color}
                      onChange={(value) => {
                        handleChangeStyleConfigData('background', {
                          ...styleConfig.background,
                          color: value,
                        });
                      }}
                      optionList={colorSelectOption}
                      renderSelectedItem={renderSelectedItem}
                      renderOptionItem={renderOptionItem}
                      dropdownClassName="selectColorDrop"
                    ></Select>
                  </div>
                </div>
                <div className="flex flex-col gap-[12px]">
                  <div>指示器</div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">数据维度</div>
                    <RadioGroup
                      type="button"
                      buttonSize="small"
                      name="demo-radio-small"
                      defaultValue={styleConfig.indicator.type}
                      onChange={(e) => {
                        handleChangeStyleConfigData('indicator', {
                          ...styleConfig.indicator,
                          type: e.target.value,
                        });
                      }}
                    >
                      <Radio value={'dot'}>点状</Radio>
                      <Radio value={'line'}>线状</Radio>
                      <Radio value={'columnar'}>柱状</Radio>
                    </RadioGroup>
                  </div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">位置</div>
                    <RadioGroup
                      type="button"
                      buttonSize="small"
                      name="demo-radio-small"
                      defaultValue={styleConfig.indicator.position}
                      onChange={(e) => {
                        handleChangeStyleConfigData('indicator', {
                          ...styleConfig.indicator,
                          position: e.target.value,
                        });
                      }}
                    >
                      <Radio value={'left'}>居左</Radio>
                      <Radio value={'center'}>居中</Radio>
                      <Radio value={'right'}>居右</Radio>
                    </RadioGroup>
                  </div>
                </div>
                <div className="flex flex-col gap-[12px]">
                  <div>箭头</div>
                  <Select
                    style={{
                      width: 300,
                      // backgroundColor: '#fff',
                    }}
                    defaultValue={styleConfig.arrow.type}
                    // prefix={textAlignIcons[styleConfig.header.textAlign]}
                    onChange={(value) => {
                      handleChangeStyleConfigData('arrow', {
                        ...styleConfig.arrow,
                        type: value,
                      });
                    }}
                  >
                    <Select.Option value="always">常驻显示</Select.Option>
                    <Select.Option value="hover">鼠标悬停时显示</Select.Option>
                  </Select>
                </div>
                <div className="flex flex-col gap-[12px]">
                  <div>过渡</div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">动画</div>
                    <Select
                      style={{
                        width: 300,
                      }}
                      defaultValue={styleConfig.transition.animation}
                      onChange={(value) => {
                        handleChangeStyleConfigData('transition', {
                          ...styleConfig.transition,
                          animation: value,
                        });
                      }}
                    >
                      <Select.Option value="slide">滑动</Select.Option>
                      <Select.Option value="fade">淡入淡出</Select.Option>
                    </Select>
                  </div>
                  <div className="bg-[rgba(var(--semi-grey-0), 1)] flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">间隔</div>
                    <InputNumber
                      value={styleConfig.transition.speed}
                      min={0}
                      formatter={(value) => `${value}ms`}
                      parser={(value) => value.replace('ms', '')}
                      onChange={(value) => {
                        handleChangeStyleConfigData('transition', {
                          ...styleConfig.transition,
                          speed: value,
                        });
                      }}
                      style={{
                        width: 290,
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabPane>
          </Tabs>
        }
      </div>
      <div className="relative h-[72px] w-[340px] bg-[--semi-color-bg-0]">
        <Button
          className="fixed bottom-[10px] right-[10px] w-[80px]"
          theme="solid"
          type="primary"
          onClick={() => saveConfig()}
        >
          确认
        </Button>
      </div>
    </div>
  );
};
