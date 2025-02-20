#region FirstRegion
FROM node:14
#endregion

# region SecondRegion
WORKDIR /app
#  region    InnerRegion  
COPY . .
#          endregion   ends InnerRegion  

#region
RUN npm install
#endregion
# endregion
