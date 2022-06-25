import {
  Classes,
  Colors,
  FormGroup,
  NumericInput,
  Tag,
} from '@blueprintjs/core';
import { plotAtom } from 'atoms/atoms';
import { initialOffsetAtom } from 'atoms/initialOffsetAtom';
import { useNumericInputCallback } from 'hooks/useNumericInputCallback';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { useLayoutEffect, useState } from 'react';
import { roundTwoDecimals } from 'utils/utils';
import sidebarStyles from './SidebarRight.module.scss';

export const PlotDetails = () => {
  const [plot, setPlot] = useAtom(plotAtom);

  const [widthString, widthNumber, onWidthChange] = useNumericInputCallback(
    plot.width
  );

  const [heightString, heightNumber, onHeightChange] = useNumericInputCallback(
    plot.height
  );

  const onBlur = () => {
    if (widthString && heightString && widthNumber > 0 && heightNumber > 0) {
      setPlot({
        width: widthNumber,
        height: heightNumber,
      });
    }
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
            value={widthString}
            minorStepSize={null}
            intent={!widthString ? 'danger' : 'none'}
            onValueChange={onWidthChange}
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
            value={heightString}
            intent={!heightString ? 'danger' : 'none'}
            onValueChange={onHeightChange}
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
          {roundTwoDecimals(
            Number(widthString || '0') * Number(heightString || '0')
          )}
          m
        </div>
      </div>
    </div>
  );
};
