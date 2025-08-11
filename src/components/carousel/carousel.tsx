import { Carousel, Notification } from '@douyinfe/semi-ui';
import { useTypeConfigStore, useStyleConfigStore } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import {
  base,
  IAttachmentField,
  dashboard,
  DashboardState,
  IOpenSegment,
  bitable,
  PermissionEntity,
  OperationType,
  IRecord,
} from '@lark-base-open/js-sdk';
import { useTranslation } from 'react-i18next'; // 这东西有bug https://github.com/i18next/react-i18next/issues/1473
// @ts-ignore
window.bitable = bitable;

function useStore() {
  const { typeConfig } = (() => useTypeConfigStore((state) => state))();
  console.log('===typeConfig', typeConfig);
  // 样式配置数据
  const { styleConfig } = (() => useStyleConfigStore((state) => state))();
  return { typeConfig, styleConfig }
}

export const CarouselComponents: React.FC = () => {



  const [titleListMap, setTitleListMap] = useState<Map<string, string> | null>(null);

  const [secTitleLisMap, setSecTitleListMap] = useState<Map<string, string> | null>(null);

  const [backgroundImageList, setBackgroundImageList] = useState<any[]>([]);

  const [carouselItemArray, setCarouselItemArray] = useState<any[]>([]);

  const { typeConfig, styleConfig } = useStore();
  const { t } = useTranslation();
  window.t = t;
  useEffect(() => {
    async function getTableData() {
      // 恢复配置检查
      if (!typeConfig.tableId) {
        return;
      }
      // console.log('获取table data');
      // 获取Table
      const table = await base.getTable(typeConfig.tableId);

      // 筛选出 符合范围的 records
      const { records } = await Promise.race<{ records: IRecord[] }>([table.getRecordsByPage({
        pageSize: typeConfig.rowLength,
        viewId: typeConfig.rowRange === 'All' ? undefined : typeConfig.rowRange,
      }), new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('获取数据超时'));
        }, 8000);
      })]).catch(async (e) => {
        const hasPermission = await bitable.base.getPermission({
          entity: PermissionEntity.Table,
          param: {
            tableId: typeConfig.tableId,
          },
          type: OperationType.Visible,
        }).catch(() => false);

        console.log('hasPermission--->', hasPermission);

        if (!hasPermission) {
          const tableName = typeConfig.tableName || await table.getName() || table.id;
          Notification.close('noPermission');

          Notification.warning({
            content: window.t('noPermission', { tableName }),
            title: window.t('getDataError'),
            duration: 0,
            position: 'top',
            id: 'noPermission',
          })
          return {
            records: [],
          };
        }
        Notification.warning({
          content: e.message,
          title: window.t('getDataError'),
          duration: 0,
          position: 'top'
        })
        return {
          records: [],
        };
      })

      console.log('records--->', records);

      // 主题
      if (typeConfig.title !== 'hidden') {
        const recordTitleListMap = new Map();
        records.forEach((item) => {
          const text = item.fields[typeConfig.title]
            ? (item?.fields?.[typeConfig.title] as IOpenSegment[])?.map((cell) => cell.text).join('')
            : '';
          recordTitleListMap.set(item.recordId, text);
        });
        setTitleListMap(recordTitleListMap);
      } else {
        setTitleListMap(null);
      }

      // 副标题
      if (typeConfig.secTitle !== 'hidden') {
        const recordSecTitleListMap = new Map<string, string>();
        records.forEach((item) => {
          const text = item.fields[typeConfig.secTitle]
            ? (item?.fields?.[typeConfig.secTitle] as IOpenSegment[])?.map((cell) => cell.text).join('')
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
  }, [typeConfig]); // 添加typeConfig依赖

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
                backgroundRepeat: 'no-repeat',
                backgroundSize:
                  styleConfig.background.size === 'fill'
                    ? '100% 100%'
                    : styleConfig.background.size,
                backgroundImage: `url(${typeConfig.backGround !== 'hidden' &&
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
                        fontWeight: `${styleConfig.title.fontWeight ? 600 : 400
                          }`,
                        fontStyle: `${styleConfig.title.fontStyle ? 'italic' : 'normal'
                          }`,
                        textDecoration: `${styleConfig.title.textUnderline ? 'underline' : ''
                          } ${styleConfig.title.lineThrough ? 'line-through' : ''
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
                        fontWeight: `${styleConfig.secTitle.fontWeight ? 600 : 400
                          }`,
                        fontStyle: `${styleConfig.secTitle.fontStyle ? 'italic' : 'normal'
                          }`,
                        textDecoration: `${styleConfig.secTitle.textUnderline ? 'underline' : ''
                          } ${styleConfig.secTitle.lineThrough ? 'line-through' : ''
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
