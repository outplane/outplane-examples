FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY dotnet-minimal-api-example.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app
ENV PORT=8080
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}

COPY --from=build /app/out ./

EXPOSE 8080

ENTRYPOINT ["dotnet", "dotnet-minimal-api-example.dll"]
