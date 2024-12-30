import React, { Component } from "react";
import { connect } from "react-redux";
import { Avatar, Tooltip } from "antd";
import AvatarComponent from "~/components/Avatar";
import PropTypes from "prop-types";
import { showInfoStaff } from "~/services/helper";

/**
 * @propsType define
 */
const propTypes = {
  datas: PropTypes.array,
  size: PropTypes.string,
  maxCount: PropTypes.number,
};
const defaultProps = {
  datas: [],
  size: "",
  maxCount: 5,
};

export class AvatarGroup extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { datas, size, maxCount } = this.props;

    let styles = {};
    if (size == "small") {
      styles = { width: 32 };
    }

    if (size == "large") {
      styles = { width: 42 };
    }

    if (!datas.length) return "";
    return (
      <div style={{ marginLeft: 5 }}>
        <Avatar.Group size={size} maxCount={maxCount}>
          {datas.map((d) => (
            <div key={d.staff_id}>
              <Tooltip
                placement="top"
                key={d.staff_id}
                title={
                  <span>
                    {d.staff_name}
                    <br />
                    <small>
                      {showInfoStaff(
                        d.position_id,
                        d.staff_dept_id,
                        d.major_id,
                        d.staff_loc_id
                      )}
                    </small>
                  </span>
                }
              >
                <div style={{ marginLeft: -5 }}>
                  <AvatarComponent
                    size={size}
                    src={d.avatar}
                    name={d.staff_name}
                  />
                </div>
              </Tooltip>
            </div>
          ))}
        </Avatar.Group>
      </div>
    );
  }
}

AvatarGroup.propTypes = propTypes;
AvatarGroup.defaultProps = defaultProps;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AvatarGroup);
