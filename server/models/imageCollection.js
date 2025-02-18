import { Schema, model } from 'mongoose';

const imageCollectionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    texture: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const ImageCollection = model('ImageCollection', imageCollectionSchema);

export default ImageCollection;