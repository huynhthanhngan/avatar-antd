import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { uniqueId } from 'lodash';
import MdEditorRender from '../MdEditor/MdEditorRender';

const LoadMore = (props) => {
    const [ellipsis, setEllipsis] = useState(false);
    const [visibleEllipsis, setVisibleEllipsis] = useState(false);

    const refContent = useRef(null)

    useEffect(() => {
        setTimeout(() => countLines(), 300);
    }, [props.content])

    const countLines = () => {
        const divHeight = refContent.current?.offsetHeight;
        const lineHeight = parseInt(refContent.current?.style?.lineHeight);
        const lines = divHeight / lineHeight;

        if (lines > props.rowEllipes) {
            setEllipsis(true);
            setVisibleEllipsis(true);
        }
    }

    return (
        <div>
            <div ref={refContent} className={`${ellipsis ? 'content editor' : 'editor'}`} style={{ lineHeight: '22px' }}>
                {
                    props.isHTML ? <div dangerouslySetInnerHTML={{ __html: props.content }} /> : <MdEditorRender key={uniqueId('render-editor')} value={props.content} />
                }
            </div>
            {!visibleEllipsis || <p type='text' className='text-hsk cursor-pointer' onClick={() => setEllipsis(!ellipsis)}> {ellipsis ? 'Xem thêm' : 'Ẩn bớt'}</p>}

            <style dangerouslySetInnerHTML={{
                __html: `
                .content {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    -webkit-line-clamp: ${props.rowEllipes};
                    -webkit-box-orient: vertical;
                    display: -webkit-box;
                    display: -moz-box;
                }
            `}} />
        </div>
    )
}

/**
 * @propsType define
 */
const propTypes = {
    hasLink: PropTypes.bool,
    rowEllipes: PropTypes.number,
    isHTML: PropTypes.bool
};

const defaultProps = {
    hasLink: true,
    rowEllipes: 12,
    isHTML: false
}


LoadMore.propTypes = propTypes;
LoadMore.defaultProps = defaultProps;


const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(LoadMore)
