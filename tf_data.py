import sys
import tensorflow as tf
from glob import glob
from lib.utils import dataset_util


flags = tf.app.flags
flags.DEFINE_string('data_dir', '', 'Root directory to raw image dataset.')
flags.DEFINE_string('output_dir', '', 'Path to directory to output TFRecords.')
flags.DEFINE_string('label_file', '', 'Paht to file for labels/annotations')
FLAGS = flags.FLAGS

def create_tf_example(filename):

  height = 256
  width = 256
  with tf.gfile.GFile(filename, 'rb') as fid:
    encoded_image_data = fid.read()
  image_format = b'png'

  xmins = [] # List of normalized left x coordinates in bounding box (1 per box)
  xmaxs = [] # List of normalized right x coordinates in bounding box
             # (1 per box)
  ymins = [] # List of normalized top y coordinates in bounding box (1 per box)
  ymaxs = [] # List of normalized bottom y coordinates in bounding box
             # (1 per box)
  classes_text = [] # List of string class name of bounding box (1 per box)
  classes = [] # List of integer class id of bounding box (1 per box)

  tf_example = tf.train.Example(features=tf.train.Features(feature={
      'image/height': dataset_util.int64_feature(height),
      'image/width': dataset_util.int64_feature(width),
      'image/filename': dataset_util.bytes_feature(filename),
      'image/source_id': dataset_util.bytes_feature(filename),
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


def main(_):
  writer = tf.python_io.TFRecordWriter(FLAGS.output_path)

  # get all image paths for the source data
  cwd = os.getcwd()
  globber = os.path.join(cwd, FLAGS.data_dir, '*.png')
  image_files = glob(globber)

  # Test images are not included in the downloaded data set, so we shall perform
  # our own split.
  random.seed(42)
  random.shuffle(image_files)
  num_examples = len(image_files)
  num_train = int(0.7 * num_examples)
  train_examples = image_files[:num_train]
  val_examples = image_files[num_train:]
  logging.info('%d training and %d validation examples.',
               len(train_examples), len(val_examples))

  train_output_path = os.path.join(FLAGS.output_dir, 'building_train.record')
  val_output_path = os.path.join(FLAGS.output_dir, 'building_val.record')
  # create_tf_record(train_output_path, label_map_dict, annotations_dir, train_examples)
  # create_tf_record(val_output_path, label_map_dict, annotations_dir, val_examples)

  # for example in train_examples:
  #     tf_example = create_tf_example(example)
  #     writer.write(tf_example.SerializeToString())
  #
  # for example in val_examples:


  writer.close()


if __name__ == '__main__':
  tf.app.run()
