import { Cell, ICellProps } from '@blueprintjs/table';
import { FC } from 'react';

export const CustomCell: FC<ICellProps> = (props) => {
  return (
    <Cell
      {...props}
      style={{
        ...props.style,
        cursor: 'default',
        lineHeight: 'normal',
        display: 'flex',
        alignItems: 'center',
      }}
    />
  );
};
