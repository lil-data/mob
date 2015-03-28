import matplotlib
matplotlib.use('TKAgg')
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

from numpy import linalg
from numpy import ones
from numpy import uint8
from numpy import real
from numpy import imag
from numpy import roll


img = mpimg.imread('grid.jpg') # load an image


zp=[157+148j, 78+149j, 54+143j]; # (zs) the complex point zp[i]
wa=[147+143j, 78+140j, 54+143j]; # (ws) will be in wa[i]

# transformation parameters
a = linalg.det([[zp[0]*wa[0], wa[0], 1],
                [zp[1]*wa[1], wa[1], 1],
                [zp[2]*wa[2], wa[2], 1]]);

b = linalg.det([[zp[0]*wa[0], wa[0], wa[0]],
                [zp[1]*wa[1], wa[1], wa[1]],
                [zp[2]*wa[2], wa[2], wa[2]]]);

c = linalg.det([[zp[0], wa[0], 1],
                [zp[1], wa[1], 1],
                [zp[2], wa[2], 1]]);

d = linalg.det([[zp[0]*wa[0], zp[0], 1],
                [zp[1]*wa[1], zp[1], 1],
                [zp[2]*wa[2], zp[2], 1]]);

r = ones((500,500,3),dtype=uint8)*255 # empty-white image
for i in range(img.shape[0]):
    for j in range(img.shape[1]):
        z = complex(i,j)
        # transformation applied to the pixels coordinates
        w = (a*z+b)/(c*z+d)
        r[int(real(w)),int(imag(w)),:] = img[i,j,:] # copy of the pixel

plt.imshow(roll(r,120,axis=1))
plt.show()