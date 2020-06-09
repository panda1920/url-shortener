const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const projectRoot = path.dirname(__dirname);

module.exports = env => {
    const isProduction = env.NODE_ENV === 'production';
    const mode = isProduction ? 'production' : 'development';
    const devtool = isProduction ? false : '#eval-source-map';

    return {
        mode,
        devtool,
        entry: {
            main: path.join(projectRoot, 'index.js')
        },
        output: {
            filename: '[name].bundle.js',
            path: path.join(projectRoot, 'dist')
        },
        resolve: {
            extensions: ['.vue', '.js', '.json'],
            alias: {
                '@': path.join(projectRoot, 'src'),
                'vue$': 'vue/dist/vue.esm.js'
            }
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: path.join(projectRoot, 'src', 'template.html')
            }),
            new VueLoaderPlugin()
        ],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['babel-loader'],
                },
                {
                    test: /\.vue$/,
                    use: ['vue-loader'],
                },
                {
                    test: /\.css$/,
                    use: ['vue-style-loader', 'css-loader']
                }
            ]
        },
        devServer: {
            open: true,
            port: 8888,
        }
    };
};
