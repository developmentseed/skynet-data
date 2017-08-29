import sys
import os
import json
from PIL import Image, ImageDraw
from glob import glob

def main():
    image_path = sys.argv[1]
    annotations_file = sys.argv[2]
    output_path = sys.argv[3]

    # get all image paths for the source data
    cwd = os.getcwd()
    globber = os.path.join(cwd, image_path, '*.png')
    image_files = glob(globber)

    # read in the annotations, create a dict with z-x-y as the key
    # bounding boxes as the values
    a_dict = {}
    with open(annotations_file, 'r') as file:
        annotations = file.readlines()
        for line in annotations:
            bounding_boxes, tile = line.split(' ')
            a_dict[tile.strip()] = bounding_boxes


    # iterate over our source data images
    for index, image in enumerate(image_files):
        source_img = Image.open(image)
        bn = os.path.basename(image)
        key = os.path.splitext(bn)[0]

        # find the matching annotation(s) and draw it/them on the image
        to_draw = json.loads(a_dict.get(key, '[]'))
        for box in to_draw:
            draw = ImageDraw.Draw(source_img)
            draw.rectangle(((box[0], box[1]), (box[2], box[3])), outline='red')

        # status and save
        print('%s of %s: Writing annotated tile  %s' % (index, len(image_files), bn))
        source_img.save(os.path.join(output_path, bn), 'PNG')


if __name__ == '__main__':
  main()
