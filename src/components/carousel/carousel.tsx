import { Carousel } from '@douyinfe/semi-ui';
import { useTypeConfigStore, useStyleConfigStore } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import {
  base,
  IAttachmentField,
  dashboard,
  DashboardState,
} from '@lark-base-open/js-sdk';

export const CarouselComponents: React.FC = () => {
  // const defaultImgList = [
  //   'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-1.png',
  //   'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-2.png',
  //   'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-3.png',
  //   'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-2.png',
  //   'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-3.png',
  // ];

  // const defaultList = [
  //   'Semi 设计管理系统',
  //   '从 Semi Design，到 Any Design',
  //   'Semi 物料市场',
  //   '面向业务场景的定制化组件，支持线上预览和调试',
  //   'Semi Template',
  //   '高效的 Design2Code 设计稿转代码',
  // ];

  // const defaultSecTitle = [
  //   '快速定制你的设计系统，并应用在设计稿和代码中',
  //   '内容由 Semi Design 用户共建',
  //   '海量 Figma 设计模板一键转为真实前端代码',
  // ];

  // 类型与数据
  const { typeConfig } = useTypeConfigStore((state) => state);

  // 样式配置数据
  const { styleConfig } = useStyleConfigStore((state) => state);

  const [titleListMap, setTitleListMap] = useState(null);

  const [secTitleLisMap, setSecTitleListMap] = useState(null);

  const [backgroundImageList, setBackgroundImageList] = useState<any[]>([]);

  const [carouselItemArray, setCarouselItemArray] = useState<any[]>([]);

  useEffect(() => {
    async function getTableData() {
      // console.log('获取table data');
      // 获取Table
      const table = await base.getTable(typeConfig.tableId);

      // 筛选出 符合范围的 records
      const { records } = await table.getRecords({
        pageSize: typeConfig.rowLength,
        viewId: typeConfig.rowRange === 'All' ? undefined : typeConfig.rowRange,
      });

      // 主题
      if (typeConfig.title !== 'hidden') {
        const recordTitleListMap = new Map();
        records.forEach((item) => {
          const text = item.fields[typeConfig.title]
            ? item.fields[typeConfig.title][0].text
            : '';
          recordTitleListMap.set(item.recordId, text);
        });
        setTitleListMap(recordTitleListMap);
      } else {
        setTitleListMap(null);
      }

      // 副标题
      if (typeConfig.secTitle !== 'hidden') {
        const recordSecTitleListMap = new Map();
        records.forEach((item) => {
          const text = item.fields[typeConfig.secTitle]
            ? item.fields[typeConfig.secTitle][0].text
            : '';
          recordSecTitleListMap.set(item.recordId, text);
        });

        setSecTitleListMap(recordSecTitleListMap);
      } else {
        setSecTitleListMap(null);
      }
      // 背景图
      if (typeConfig.backGround !== 'hidden') {
        const attachmentField = await table.getField<IAttachmentField>(
          typeConfig.backGround,
        );

        const [...recordBackgroundList] = await Promise.all(
          records.map(async (item) => {
            if (item.fields[typeConfig.backGround]) {
              const urlList = await attachmentField.getAttachmentUrls(
                item.recordId,
              );
              return urlList.map((url) => {
                return {
                  id: item.recordId,
                  url,
                };
              });
            } else {
              return {
                id: item.recordId,
                url: '',
              };
            }
          }),
        );

        const backcgroundImageObjectList = recordBackgroundList.flat();

        setBackgroundImageList([...backcgroundImageObjectList]);

        setCaroulList(backcgroundImageObjectList.length, records.length);
      } else {
        const recordBackgroundList = Array(records.length)
          .fill('')
          .map((item, index) => {
            return { id: records[index].recordId, url: '' };
          });
        setBackgroundImageList([...recordBackgroundList]);
        setCaroulList(recordBackgroundList.length, records.length);
      }
    }
    getTableData();
  }, [typeConfig, styleConfig]);

  // 设置轮播图元素
  const setCaroulList = (imageLength: number, recordsLength: number) => {
    const arrLength =
      imageLength > typeConfig.rowLength
        ? imageLength
        : recordsLength < typeConfig.rowLength
        ? recordsLength
        : typeConfig.rowLength;
    const newCarosel = Array(arrLength).fill(
      JSON.stringify(new Date()) + typeConfig.title + typeConfig.secTitle,
    );

    setCarouselItemArray([...newCarosel]);
  };

  // 颜色计算
  function convertColorWithOpacity(color: string, opacity: number): string {
    // 从 color 中提取 RGB 值
    const rgbValues = color.match(/\d+/g)?.map(Number);
    if (!rgbValues || rgbValues.length !== 4) {
      return '';
    }

    // 计算新的 alpha 值
    const newAlpha = opacity / 100;

    // 构建新的 rgba 字符串
    return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${newAlpha})`;
  }

  const caroulKey = useMemo(() => {
    return JSON.stringify(new Date());
  }, [typeConfig, styleConfig]);

  return (
    <div
      className="relative flex-1 h-screen"
      style={{
        borderTop:
          dashboard.state === DashboardState.View ? 'none' : '0.5px solid ',
        borderColor:
          typeConfig.theme === 'light'
            ? 'rgba(207,207,207, 0.15)'
            : 'rgba(31, 35, 41, 0.15)',
      }}
    >
      <Carousel
        style={{
          width: '100%',
          height: '100%',
        }}
        theme={typeConfig?.theme}
        showArrow={typeConfig.control.includes('arrow')}
        showIndicator={typeConfig.control.includes('indicator')}
        arrowType={styleConfig.arrow.type}
        speed={styleConfig.transition.speed}
        animation={styleConfig.transition.animation}
        indicatorType={styleConfig.indicator.type}
        indicatorPosition={styleConfig.indicator.position}
      >
        {carouselItemArray.map((item, index) => {
          return (
            <div
              key={item + index + caroulKey}
              style={{
                backgroundSize:
                  styleConfig.background.size === 'fill'
                    ? '100% 100%'
                    : styleConfig.background.size,
                backgroundImage: `url(${
                  typeConfig.backGround !== 'hidden' &&
                  backgroundImageList[index]
                    ? backgroundImageList[index].url
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
                      {titleListMap &&
                        titleListMap.get(backgroundImageList[index].id)}
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
                      {secTitleLisMap &&
                        secTitleLisMap.get(backgroundImageList[index].id)}
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
