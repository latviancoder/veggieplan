import {
  Classes,
  Colors,
  FormGroup,
  NumericInput,
  Tag,
} from '@blueprintjs/core';
import { plotAtom } from 'atoms/atoms';
import { drawableAreaAtom } from 'atoms/drawableAreaAtom';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { useState } from 'react';
import { roundTwoDecimals } from 'utils/utils';
import sidebarStyles from './SidebarRight.module.scss';

export const PlotDetails = () => {
  const updateDrawablaArea = useUpdateAtom(drawableAreaAtom);
  const [plot, setPlot] = useAtom(plotAtom);

  const [width, setWidth] = useState<string | undefined>(String(plot.width));
  const [height, setHeight] = useState<string | undefined>(String(plot.height));

  const onBlur = () => {
    // if (width === 0) setWidth(10);
    // if (height === 0) setHeight(10);
    setPlot({
      width: Number(width),
      height: Number(height),
    });

    updateDrawablaArea();
  };

  return (
    <div className={sidebarStyles.root}>
      <h4 className={Classes.HEADING} style={{ margin: 0 }}>
        Garten
      </h4>
      <div className={sidebarStyles.twoColumns}>
        <FormGroup
          label={'Breite'}
          labelFor="text-input1"
          style={{ margin: 0 }}
        >
          <NumericInput
            buttonPosition="none"
            id="text-input1"
            placeholder="m"
            locale="de-DE"
            fill
            value={width}
            onValueChange={(valueAsNumber, valueAsString) => {
              if (!valueAsString) {
                setWidth('');
                return;
              }

              const value = Math.round(valueAsNumber);

              if (isNaN(value) || value < 0) return;

              setWidth(valueAsString);
            }}
            onBlur={onBlur}
            rightElement={<Tag minimal>m</Tag>}
          />
        </FormGroup>
        <FormGroup label={'Länge'} labelFor="text-input2" style={{ margin: 0 }}>
          <NumericInput
            buttonPosition="none"
            id="text-input2"
            placeholder="m"
            locale="de-DE"
            fill
            value={height}
            onValueChange={(valueAsNumber, valueAsString) => {
              if (!valueAsString) {
                setHeight('');
                return;
              }

              const value = Math.round(valueAsNumber);

              if (isNaN(value) || value < 0) return;

              setHeight(valueAsString);
            }}
            onBlur={onBlur}
            rightElement={<Tag minimal>m</Tag>}
          />
        </FormGroup>
      </div>
      <div className={sidebarStyles.twoColumns}>
        <div>
          <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
            Fläche
          </h6>
          {roundTwoDecimals(Number(width || '0') * Number(height || '0'))}m
        </div>
      </div>
    </div>
  );
};
