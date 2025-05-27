"""
Description: These Python modules are designed to capture detailed
browser usage datafor analysis, with both server and client
components working together to record and store the information.

Author: Carlos A. Planchón
https://github.com/carlosplanchon/

Adapt this code to your needs.

Feedback is appreciated!
"""

#####################
#                   #
#   --- UTILS ---   #
#                   #
#####################

import base64


def b64_to_png(b64_string: str, output_file):
	"""
	Convert a Base64-encoded string to a PNG file.

	:param b64_string: A string containing Base64-encoded data
	:param output_file: The path to the output PNG file
	"""
	with open(output_file, 'wb') as f:
		f.write(base64.b64decode(b64_string))