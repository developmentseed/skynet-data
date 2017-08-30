"""
Usage:
  # From skynet-data/
  python tf_data.py \
    --label_file=data/labels/labels.txt \
    --data_dir=school_tiles \
    --output_file=tf_output \
    --inspection_dir=inspect
"""

import sys
import os
import json
import random
import tensorflow as tf
from glob import glob
from lib import dataset_util
from PIL import Image, ImageDraw

flags = tf.app.flags
flags.DEFINE_string('data_dir', '', 'Root directory to raw image dataset.')
flags.DEFINE_string('output_dir', '', 'Path to directory to output TFRecords.')
flags.DEFINE_string('label_file', '', 'Path to file for labels/annotations.')
flags.DEFINE_string('inspection_dir', '', 'Path to director to output labelled images for inspection.')
FLAGS = flags.FLAGS

# seems like smaller labels don't work with this
# https://github.com/tensorflow/models/issues/1907
def check_size(box):
    height = box[3] - box[1]
    width = box[2] - box[0]
    if height < 10 or width < 10:
        return False
    else:
        return True

def create_tf_example(filename, draw_path, a_dict):
    bn = os.path.basename(filename)
    key = os.path.splitext(bn)[0]

    height = 256
    width = 256
    with tf.gfile.GFile(filename, 'rb') as fid:
        encoded_image_data = fid.read()
    image_format = b'jpeg'

    xmins = [] # List of normalized left x coordinates in bounding box (1 per box)
    xmaxs = [] # List of normalized right x coordinates in bounding box
             # (1 per box)
    ymins = [] # List of normalized top y coordinates in bounding box (1 per box)
    ymaxs = [] # List of normalized bottom y coordinates in bounding box
             # (1 per box)
    classes_text = [] # List of string class name of bounding box (1 per box)
    classes = [] # List of integer class id of bounding box (1 per box)

    # find the matching annotation(s) and add them to the above arrays
    bb = json.loads(a_dict.get(key, '[]'))
    source_img = False
    if bb:
        source_img = Image.open(filename)
    for box in bb:
        if check_size(box):
            # add bounding box information to eventual record data
            xmins.append(box[0] / width)
            ymins.append(box[1] / height)
            xmaxs.append(box[2] / width)
            ymaxs.append(box[3] / height)
            classes_text.append(b'Building')
            classes.append(1)

            # also draw it for visual inspection
            draw = ImageDraw.Draw(source_img)
            draw.rectangle(((box[0], box[1]), (box[2], box[3])), outline='red')

    if source_img:
        source_img.save(os.path.join(draw_path, bn), 'PNG')

    # if we didn't add anything, don't create a record
    if not classes:
        return False

    tf_example = tf.train.Example(features=tf.train.Features(feature={
      'image/height': dataset_util.int64_feature(height),
      'image/width': dataset_util.int64_feature(width),
      'image/filename': dataset_util.bytes_feature(filename.encode('utf8')),
      'image/source_id': dataset_util.bytes_feature(filename.encode('utf8')),
      'image/encoded': dataset_util.bytes_feature(encoded_image_data),
      'image/format': dataset_util.bytes_feature(image_format),
      'image/object/bbox/xmin': dataset_util.float_list_feature(xmins),
      'image/object/bbox/xmax': dataset_util.float_list_feature(xmaxs),
      'image/object/bbox/ymin': dataset_util.float_list_feature(ymins),
      'image/object/bbox/ymax': dataset_util.float_list_feature(ymaxs),
      'image/object/class/text': dataset_util.bytes_list_feature(classes_text),
      'image/object/class/label': dataset_util.int64_list_feature(classes),
    }))
    return tf_example


def write_records(examples, output_file, inspection_path, a_dict):
    count = 0
    writer = tf.python_io.TFRecordWriter(output_file)
    for index, example in enumerate(examples):
        print('Writing %d of %d' % (index, len(examples)))
        tf_example = create_tf_example(example, inspection_path, a_dict)
        if tf_example:
            writer.write(tf_example.SerializeToString())
            count += 1

    print('Wrote %d records. %d dropped' % (count, len(examples) - count))
    writer.close()


def main(_):
    # get all image paths for the source data
    cwd = os.getcwd()
    globber = os.path.join(cwd, FLAGS.data_dir, '*.png')
    image_files = glob(globber)

    # Test images are not included in the downloaded data set, so we do
    # our own split.
    random.seed(42)
    random.shuffle(image_files)
    num_examples = len(image_files)
    num_train = int(0.7 * num_examples)
    train_examples = image_files[:num_train]
    val_examples = image_files[num_train:]

    # read in the annotations, create a dict with z-x-y as the key
    # bounding boxes as the values
    a_dict = {}
    with open(FLAGS.label_file, 'r') as file:
        annotations = file.readlines()
        for line in annotations:
            bounding_boxes, tile = line.split(' ')
            a_dict[tile.strip()] = bounding_boxes

    train_output_path = os.path.join(FLAGS.output_dir, 'building_train.record')
    val_output_path = os.path.join(FLAGS.output_dir, 'building_val.record')

    train_inspection_path = os.path.join(FLAGS.inspection_dir, 'train')
    val_inspection_path = os.path.join(FLAGS.inspection_dir, 'val')
    if not os.path.exists(train_inspection_path):
        os.makedirs(train_inspection_path)
    if not os.path.exists(val_inspection_path):
        os.makedirs(val_inspection_path)

    write_records(train_examples, train_output_path, train_inspection_path, a_dict)
    write_records(val_examples, val_output_path, val_inspection_path, a_dict)


if __name__ == '__main__':
  tf.app.run()
