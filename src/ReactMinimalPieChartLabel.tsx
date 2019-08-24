import React from 'react';
import PropTypes from 'prop-types';
import { dataPropType } from './propTypes';
import { Data } from './commonTypes';

type Props = {
  data: Data;
  dataIndex: number;
  color: string;
};

export default function ReactMinimalPieChartLabel({
  data,
  dataIndex,
  color,
  ...props
}: Props) {
  return (
    <text
      textAnchor="middle"
      dominantBaseline="middle"
      fill={color}
      {...props}
    />
  );
}

ReactMinimalPieChartLabel.displayName = 'ReactMinimalPieChartLabel';

ReactMinimalPieChartLabel.propTypes = {
  data: dataPropType,
  dataIndex: PropTypes.number,
  color: PropTypes.string,
};
