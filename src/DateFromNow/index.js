import React from 'react';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { timeFormatStandard } from '~/services/helper';
import { DIRECTORY_CONVERT_VI } from './directory';

var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.locale("vi");
dayjs.extend(relativeTime)
export const DateFromNow = (props) => {
    if (typeof props.date == 'undefined') {
        return [];
    }

    const timeFormat = timeFormatStandard(props.date, 'HH:mm DD/MM/YYYY');
    let result;
    if (dayjs().diff(dayjs(props.date), 'hours') > 21) {
        result = timeFormat;
    } else {
        result = dayjs(props.date).fromNow();

        if (result === 'vài giây tới') {
            result = DIRECTORY_CONVERT_VI[result];
        }

    }
    return (
        <Tooltip title={timeFormat}>
            {result}
        </Tooltip>
    )
}

DateFromNow.defaultProps = {
    date: '',
}

export default DateFromNow
