# Use the official Nginx image from the Docker Hub
FROM nginx:alpine

# Copy the static site files from the local dist directory to the Nginx default web folder
COPY dist/ /usr/share/nginx/html/

# Expose port 80 to be able to access the site from the host
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]