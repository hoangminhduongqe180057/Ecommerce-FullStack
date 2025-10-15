# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Ecom.Api.csproj", "./"]
RUN dotnet restore "Ecom.Api.csproj"

# Copy source code and build
COPY . .
RUN dotnet build "Ecom.Api.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "Ecom.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy published files
COPY --from=publish /app/publish .

# Expose port (Render will inject $PORT dynamically)
EXPOSE 10000

# Set environment - IMPORTANT: Use ${PORT:-10000} to read Render's $PORT variable
ENV ASPNETCORE_URLS=http://+:${PORT:-10000}
ENV ASPNETCORE_ENVIRONMENT=Production

# Run application
ENTRYPOINT ["dotnet", "Ecom.Api.dll"]
