import React from "react";
export default class Image extends React.Component {
    getSrc(e) {
        e.target.src = this.props.defaultImg;
    }

    render() {
        let image = this.props.src;
        if(image && !/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)(@\d*[h|w](_\d*[h|w])?(_0e|_1e)?)?$/.test(image)){
            image = this.props.defaultImg;
        }
        return (
            <img src={image} alt="" onError={(e)=>this.getSrc(e)}/>
        );
    }
}