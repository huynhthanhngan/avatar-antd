import React from 'react';
import { connect } from 'react-redux';
import { Avatar } from 'antd';
import { getThumbnailHR } from '~/services/helper';

export const AvatarComponent = (props) => {

    /**
     * get first character of word first and last
     */
    const getFirstCharacter = (str) => {
        let result = '';
        if(str) {
            const arrWord = str.split(' ');
            if(arrWord.length == 1) {
                result = arrWord[0].substr(0,1);
            } else {
                result = arrWord[0].substr(0,1) + arrWord[arrWord.length - 1].substr(0,1);
            }
        }

        return result ? result.toUpperCase() : '';
    }
    if(props.owner) {
        return props.profile?.avatar ?
        <Avatar size={props.size} src={props.profile.avatar} alt='' />
        : <Avatar
            style={{
                backgroundColor: '#f56a00',
                verticalAlign: 'middle',
                width: !props.size ? 32 : props.size == 'large' ? 41 : 21
            }}
            size={props.size}
        >
            <span style={{ fontSize: props.size == 'large' ? 17 : 12 }}>{getFirstCharacter(props.staff_info?.staff_name)}</span>
        </Avatar>
    } else {
        return props.src ?
        <Avatar size={props.size} src={getThumbnailHR(props.src)} alt='' />
        : <Avatar
            style={{
                backgroundColor: '#f56a00',
                verticalAlign: 'middle',
                width: !props.size ? 32 :  props.size == 'large' ? 41 : 26
            }}
            size={props.size}
        >
            <span style={{ fontSize: props.size == 'large' ? 17 : 12 }}>{getFirstCharacter(props.name)}</span>
        </Avatar>
    }
}

AvatarComponent.defaultProps = {
    owner: false,
    src: '',
    name: '',
    size: 'large'
}

const mapStateToProps = (state) => {
    return {
        profile: state.auth.info.profile,
        staff_info: state.auth.info.staff_info,
    }
}

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(AvatarComponent)
