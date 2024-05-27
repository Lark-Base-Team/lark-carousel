import {
  dashboard,
  bridge,
  ThemeModeType,
  SourceType,
  IDataRange,
  FieldType,
} from '@lark-base-open/js-sdk';
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
import {
  IconAlignLeft,
  IconAlignRight,
  IconAlignCenter,
  IconFont,
  IconChevronDown,
} from '@douyinfe/semi-icons';
import { useTypeConfigStore, useStyleConfigStore } from '@/store';
import { ITableSource } from '../../App';
import HorizontalLine from '@/assets/svg/horizontal-line.svg?react';
import BoldIcon from '@/assets/svg/bold.svg?react';
import ItalicIcon from '@/assets/svg/italic.svg?react';
import UnderlineIcon from '@/assets/svg/underline.svg?react';
import { useTranslation } from 'react-i18next';

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
  getTableConfig: (id: string | null) => any;
}

export const ConfigPanel: React.FC<IConfigPanelPropsType> = (props) => {
  const { tableSource, dataRange, categories, getTableConfig } = props;

  const { t, i18n } = useTranslation();

  // 类型与数据
  const { typeConfig, updateTypeConfig } = useTypeConfigStore((state) => state);

  const formApi = useRef<any>();

  // 样式配置数据
  const { styleConfig, updateStyleConfig } = useStyleConfigStore(
    (state) => state,
  );

  const { Option } = Form.Select;

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

      // 主题
      const theme = await bridge.getTheme();
      switchTheme(theme);

      // 语言
      const locale = await bridge.getLocale();
      i18n.changeLanguage(locale);

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
    { label: '', value: 'rgba(255, 255, 255, 1)' },
    { label: '', value: 'rgba(31, 35, 41, 1)' },
    { label: '', value: 'rgba(51, 109, 244, 1)' },
    { label: '', value: 'rgba(122, 53, 240, 1)' },
    { label: '', value: 'rgba(53, 189, 75, 1)' },
    { label: '', value: 'rgba(45, 190, 171, 1)' },
    { label: '', value: 'rgba(255, 198, 10, 1)' },
    { label: '', value: 'rgba(255, 129, 26, 1)' },
    { label: '', value: 'rgba(245, 74, 69, 1)' },
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
          className="h-[18px] w-[18px] rounded-[6px] border-[1px] border-[--semi-color-border]"
          style={{ backgroundColor: value }}
        ></div>
      </div>
    );
  };

  const renderSelectedItem = (optionNode: any) => {
    return (
      <div className="w-full">
        <div
          className="h-[18px] w-[18px] rounded-[6px] border-[1px] border-[--semi-color-border]"
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
            <TabPane tab={t('tab_name1')} itemKey="1">
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
                    label={{ text: t('data_source') }}
                    style={{ width: 300 }}
                    onChange={async (selectValue) => {
                      const { categories } = await getTableConfig(
                        selectValue as string,
                      );
                      const textField = categories.filter(
                        (item: any) => item.type === FieldType.Text,
                      );

                      const imageFile = categories.filter(
                        (item: any) => item.type === FieldType.Attachment,
                      );

                      const { tableId, ...otherProperties } = typeConfig;
                      console.log(tableId);

                      // 更改表格的时候重置其他的默认数据
                      const newConfig = {
                        ...otherProperties,
                        tableId: selectValue,
                        rowRange: 'All',
                        title: textField[0] ? textField[0].id : 'hidden',
                        secTitle: textField[0] ? textField[0].id : 'hidden',
                        backGround: imageFile[0] ? imageFile[0].id : 'hidden',
                      };

                      // updateTypeConfig({ ...typeConfig, ...newConfig });
                      formApi.current.setValues({ ...newConfig });
                      // return selectValue;
                    }}
                    optionList={tableSource.map((source) => ({
                      value: source.tableId,
                      label: source.tableName,
                    }))}
                  />
                  <Form.Select
                    field="rowRange"
                    label={{ text: t('data_range') }}
                    style={{ width: 300 }}
                    remote={true}
                    optionList={dataRange.map((range) => {
                      const { type, viewName, viewId } = range as any;
                      if (type === SourceType.ALL) {
                        return {
                          value: 'All',
                          label: t('view_all'),
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
                    label={{ text: t('title') }}
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
                    label={{ text: t('sec_title') }}
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
                    label={{ text: t('background_image') }}
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
                    label={{ text: t('records') }}
                    min={1}
                    max={20}
                    style={{ width: 300 }}
                  />
                  <div className="my-[10px] h-[0.5px] w-[300px] bg-[#1F232926]"></div>
                  <Form.Select
                    field="theme"
                    label={{ text: t('theme') }}
                    style={{ width: 300 }}
                  >
                    <Option value="light">{t('light')}</Option>
                    <Option value="dark">{t('dark')}</Option>
                  </Form.Select>
                  <Form.CheckboxGroup
                    field="control"
                    label={{ text: t('carousel_options') }}
                    direction="horizontal"
                  >
                    <Form.Checkbox value="indicator">
                      {t('indicator')}
                    </Form.Checkbox>
                    <Form.Checkbox value="arrow">{t('arrow')}</Form.Checkbox>
                  </Form.CheckboxGroup>
                </Form>
              </div>
            </TabPane>
            <TabPane tab={t('tab_name2')} itemKey="2">
              <div
                className="flex flex-col gap-[16px] overflow-y-scroll px-[20px] pb-[48px] pt-[20px]"
                style={{
                  height: `calc(100vh - 125px)`,
                }}
              >
                <div className="flex flex-1 flex-col gap-[12px]">
                  <div>{t('title')}</div>
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('text_format')}
                    </div>
                    <div className="bg[--semi-color-bg-1] flex h-[42px] w-[284px] items-center  gap-[8px] rounded-[8px] border-[1px] border-solid  border-[#1F2329] px-[10px]">
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
                        <Select.Option value="left">
                          {t('left_aligned')}
                        </Select.Option>
                        <Select.Option value="center">
                          {t('center_aligned')}
                        </Select.Option>
                        <Select.Option value="right">
                          {t('right_aligned')}
                        </Select.Option>
                      </Select>
                      <div
                        className="flex w-[26px] justify-center rounded-[3px] px-[3px] py-[3px]"
                        style={{
                          background: styleConfig.title.fontWeight
                            ? 'var(--semi-color-tertiary-light-hover)'
                            : '',
                        }}
                        onClick={() => {
                          handleChangeStyleConfigData('title', {
                            ...styleConfig.title,
                            fontWeight: !styleConfig.title.fontWeight,
                          });
                        }}
                      >
                        <BoldIcon
                          className="h-[16px] w-[16px]"
                          size="16"
                          fill="var(--semi-color-text-0)"
                        />
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
                        <ItalicIcon
                          className="h-[16px] w-[16px]"
                          size="16"
                          fill="var(--semi-color-text-0)"
                        />
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
                        <UnderlineIcon
                          className="h-[16px] w-[16px]"
                          size="16"
                          fill="var(--semi-color-text-0)"
                        />
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
                        <HorizontalLine
                          className="h-[16px] w-[16px]"
                          size="16"
                          fill="var(--semi-color-text-0)"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('width')}
                    </div>
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
                  <div>{t('sec_title')}</div>
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('text_format')}
                    </div>
                    <div className="--semi-color-bg-1 flex h-[42px] w-[284px] items-center justify-center gap-[8px] rounded-[8px] border-[1px]  border-solid border-[#1F2329] px-[10px]">
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
                        <Select.Option value="left">
                          {t('left_aligned')}
                        </Select.Option>
                        <Select.Option value="center">
                          {t('center_aligned')}
                        </Select.Option>
                        <Select.Option value="right">
                          {t('right_aligned')}
                        </Select.Option>
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
                        <BoldIcon
                          className="h-[16px] w-[16px]"
                          size="16"
                          fill="var(--semi-color-text-0)"
                        />
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
                        <ItalicIcon
                          className="h-[16px] w-[16px]"
                          size="16"
                          fill="var(--semi-color-text-0)"
                        />
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
                        <UnderlineIcon
                          className="h-[16px] w-[16px]"
                          size="16"
                          fill="var(--semi-color-text-0)"
                        />
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
                        <HorizontalLine
                          className="h-[16px] w-[16px]"
                          size="16"
                          fill="var(--semi-color-text-0)"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('width')}
                    </div>
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
                  <div>{t('background')}</div>
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('image_transparency')}
                    </div>
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
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('image_background_color')}
                    </div>
                    <Select
                      style={{
                        width: 285,
                        outline: 0,
                      }}
                      defaultValue={styleConfig.background.color}
                      onSelect={(value) => {
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
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('image_background_size')}
                    </div>
                    <Select
                      style={{
                        width: 285,
                        outline: 0,
                      }}
                      defaultValue={styleConfig.background.size}
                      onSelect={(value) => {
                        handleChangeStyleConfigData('background', {
                          ...styleConfig.background,
                          size: value,
                        });
                      }}
                    >
                      <Select.Option value="cover">{t('cover')}</Select.Option>
                      <Select.Option value="fill">{t('fill')}</Select.Option>
                      <Select.Option value="contain">
                        {t('contain')}
                      </Select.Option>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-[12px]">
                  <div>{t('indicator')}</div>
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('data_dimensions')}
                    </div>
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
                      <Radio value={'dot'}>{t('dotted')}</Radio>
                      <Radio value={'line'}>{t('linear')}</Radio>
                      <Radio value={'columnar'}>{t('columnar')}</Radio>
                    </RadioGroup>
                  </div>
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('position')}
                    </div>
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
                      <Radio value={'left'}>{t('left')}</Radio>
                      <Radio value={'center'}>{t('center')}</Radio>
                      <Radio value={'right'}>{t('right')}</Radio>
                    </RadioGroup>
                  </div>
                </div>
                <div className="flex flex-col gap-[12px]">
                  <div>{t('arrow')}</div>
                  <Select
                    style={{
                      width: 285,
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
                    <Select.Option value="always">
                      {t('permanent_display')}
                    </Select.Option>
                    <Select.Option value="hover">
                      {t('shown_mouseover')}
                    </Select.Option>
                  </Select>
                </div>
                <div className="flex flex-col gap-[12px]">
                  <div>{t('transition')}</div>
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('animation')}
                    </div>
                    <Select
                      style={{
                        width: 285,
                      }}
                      defaultValue={styleConfig.transition.animation}
                      onChange={(value) => {
                        handleChangeStyleConfigData('transition', {
                          ...styleConfig.transition,
                          animation: value,
                        });
                      }}
                    >
                      <Select.Option value="slide">{t('slide')}</Select.Option>
                      <Select.Option value="fade">{t('fade')}</Select.Option>
                    </Select>
                  </div>
                  <div className="flex h-[84px] w-[300px] flex-col gap-[8px] rounded-[6px] bg-[--semi-color-tertiary-light-default] px-[8px] py-[8px]">
                    <div className="text-[12px] text-[#646A73]">
                      {t('interval')}
                    </div>
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
                        width: 285,
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
