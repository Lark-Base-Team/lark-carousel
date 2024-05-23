import { Carousel } from '@douyinfe/semi-ui';
import { useTypeConfigStore, useStyleConfigStore } from '@/store';
import { useEffect, useState, useMemo } from 'react';
import { base, IAttachmentField } from '@lark-base-open/js-sdk';

export const CarouselComponents: React.FC = () => {
  const style = {
    width: '100%',
    height: '100%',
  };

  const defaultImgList = [
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-1.png',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-2.png',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-3.png',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-2.png',
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-3.png',
  ];

  const defaultList = [
    'Semi 设计管理系统',
    '从 Semi Design，到 Any Design',
    'Semi 物料市场',
    '面向业务场景的定制化组件，支持线上预览和调试',
    'Semi Template',
    '高效的 Design2Code 设计稿转代码',
  ];

  const defaultSecTitle = [
    '快速定制你的设计系统，并应用在设计稿和代码中',
    '内容由 Semi Design 用户共建',
    '海量 Figma 设计模板一键转为真实前端代码',
  ];

  // 类型与数据
  const { typeConfig } = useTypeConfigStore((state) => state);

  // 样式配置数据
  const { styleConfig } = useStyleConfigStore((state) => state);

  const [titleList, setTitleList] = useState([]);

  const [secTitleList, setSecTitleList] = useState([]);

  const [backgroundImageList, setBackgroundImageList] = useState([]);

  useEffect(() => {
    async function getTableData() {
      // 获取Table
      const table = await base.getTable(typeConfig.tableId);
      // console.log('table--->', table, typeConfig.rowRange);
      // 筛选出 符合范围的 records
      // Todo 筛选范围

      const { records } = await table.getRecords({
        pageSize: typeConfig.rowLength,
        viewId: typeConfig.rowRange === 'All' ? undefined : typeConfig.rowRange,
      });

      // 主题
      if (typeConfig.title !== 'hidden') {
        const recordTitleList = records.map((item) => {
          return item.fields[typeConfig.title]
            ? item.fields[typeConfig.title][0].text
            : '';
        });
        setTitleList(recordTitleList);
      } else {
        setTitleList([]);
      }

      // 副标题
      if (typeConfig.secTitle !== 'hidden') {
        const recordSecTitleList = records.map((item) => {
          const secTitleId = item.fields[typeConfig.secTitle][0];
          return item.fields[typeConfig.secTitle] ? secTitleId.text : '';
        });
        setSecTitleList([...recordSecTitleList]);
      } else {
        setSecTitleList([]);
      }

      // 背景图
      if (typeConfig.backGround !== 'hidden') {
        const attachmentField = await table.getField<IAttachmentField>(
          typeConfig.backGround,
        );

        const [...recordBackgroundList] = await Promise.all(
          records.map(async (item) => {
            if (item.fields[typeConfig.backGround]) {
              return attachmentField.getAttachmentUrls(item.recordId);
            } else {
              return null;
            }
          }),
        );
        const bakcgroundImageList = recordBackgroundList
          .filter((item) => item)
          .map((item) => item?.[0]);

        setBackgroundImageList([...bakcgroundImageList]);
      } else {
        // setBackgroundImageList([]);
      }
    }
    getTableData();
  }, [typeConfig]);

  // 渲染数组
  const itemArray = useMemo(() => {
    return Array(typeConfig.rowLength).fill(JSON.stringify(new Date()));
  }, [typeConfig, styleConfig]);

  function convertColorWithOpacity(color: string, opacity: number): string {
    // 从 color 中提取 RGB 值
    const rgbValues = color.match(/\d+/g)?.map(Number);
    console.log('rgbValues--->', rgbValues, color, opacity);
    if (!rgbValues || rgbValues.length !== 4) {
      return '';
    }

    // 计算新的 alpha 值
    const newAlpha = opacity / 100;

    // 构建新的 rgba 字符串
    return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${newAlpha})`;
  }

  return (
    <div className="relative flex-1 h-screen">
      <Carousel
        style={style}
        theme={typeConfig?.theme}
        showArrow={typeConfig.control.includes('arrow')}
        showIndicator={typeConfig.control.includes('indicator')}
        arrowType={styleConfig.arrow.type}
        speed={styleConfig.transition.speed}
        animation={styleConfig.transition.animation}
        indicatorType={styleConfig.indicator.type}
        indicatorPosition={styleConfig.indicator.position}
      >
        {itemArray.map((item, index) => {
          return (
            <div
              key={
                item +
                titleList[index] +
                secTitleList[index] +
                backgroundImageList[index] +
                index
              }
              style={{
                backgroundSize: 'cover',
                backgroundImage: `url(${
                  typeConfig.backGround !== 'hidden'
                    ? backgroundImageList[index]
                    : ''
                })`,
                // backgroundImage: `url(${backgroundImageList[index]})`,
                backgroundColor: convertColorWithOpacity(
                  styleConfig.background.color,
                  styleConfig.background.opacity,
                ),
              }}
            >
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="flex justify-center w-full">
                  {typeConfig.title !== 'hidden' && (
                    <div
                      style={{
                        width: `${styleConfig.title.width}%`,
                        fontSize: `${styleConfig.title.fontSize}px`,
                        color: `${styleConfig.title.color}`,
                        textAlign: `${styleConfig.title.textAlign}`,
                        fontWeight: `${
                          styleConfig.title.fontWeight ? 600 : 400
                        }`,
                        fontStyle: `${
                          styleConfig.title.fontStyle ? 'italic' : 'normal'
                        }`,
                        textDecoration: `${
                          styleConfig.title.textUnderline ? 'underline' : ''
                        } ${
                          styleConfig.title.lineThrough ? 'line-through' : ''
                        }`,
                      }}
                    >
                      {titleList[index]}
                    </div>
                  )}
                </div>
                {typeConfig.secTitle !== 'hidden' && (
                  <div className="flex justify-center w-full">
                    <div
                      style={{
                        width: `${styleConfig.secTitle.width}%`,
                        fontSize: `${styleConfig.secTitle.fontSize}px`,
                        lineHeight: `${styleConfig.secTitle.fontSize}px`,
                        color: `${styleConfig.secTitle.color}`,
                        textAlign: `${styleConfig.secTitle.textAlign}`,
                        fontWeight: `${
                          styleConfig.secTitle.fontWeight ? 600 : 400
                        }`,
                        fontStyle: `${
                          styleConfig.secTitle.fontStyle ? 'italic' : 'normal'
                        }`,
                        textDecoration: `${
                          styleConfig.secTitle.textUnderline ? 'underline' : ''
                        } ${
                          styleConfig.secTitle.lineThrough ? 'line-through' : ''
                        }`,
                      }}
                    >
                      {secTitleList[index]}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
};
