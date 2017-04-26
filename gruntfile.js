/**
 * Created by Mesogene on 7/15/16.
 */
module.exports = function (grunt) {

    //里面是定义的任务
    grunt.initConfig({
        watch: {
            jade: {
                files: ['views/**'],//-传递目录
                options: {
                    livereload: true
                }
            },
            js: { //监听js文件的改动
                files: ['public/javascripts/**', 'models/**/*/.js', 'schemas/**/*.js'],
                //tasks:['jshint'],
                options: {
                    livereload: true//当文件改动时重新加载
                }
            },
            uglify: {
                files: ['public/**/*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            styles: {
                files: ['public/**/*.less'],
                task: ['less'],
                options: {
                    nospawm: true
                }
            }
        },
        jshint: {
            options: {
                jshinttrc: '.jshintrc',
                ignores: ['public/lib/**/*.js']
            },
            all: ['public/javascript/*.js', 'test/**/*.js', 'app/**/*.js']
        },

        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    'public/build/index.css': 'public/less/index.less'
                }
            }
        },

        uglify: {
            development: {
                files: {
                    'public/build/admin.min.js': 'public/javascripts/admin.js',
                    'public/build/detail.min.js': [
                        'public/javascripts/detail.js'//壓縮成一份文件
                    ]
                }
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'app.js',//可以去官网搜索，查看意思
                    args: [],
                    ignoredFiles: ['README.md', 'node-modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['./'],
                    debug: true,
                    delayTime: 1, //如果有大批量的文件需要加载，等1s开始加载
                    env: {
                        PORT: 3003
                    },
                    cwd: __dirname
                }
            }
        },

        mochaTest: {//配置任务
            options: {
                reporter: 'spec'
            },
            src: ['test/**/*.js']//指定要测试的目录
        },

        concurrent: {
            tasks: ['nodemon', 'watch', 'less', 'uglify', 'jshint'],
            options: {
                logConcurrentOutput: true
            }
        }
    })
    grunt.loadNpmTasks('grunt-contrib-watch');//有改动时刷新,重新执行
    grunt.loadNpmTasks('grunt-nodemon');//时时监听APP.js,自动重启
    grunt.loadNpmTasks('grunt-concurrent');//针对慢任务，跑多个阻塞的任务
    grunt.loadNpmTasks('grunt-mocha-test')
    grunt.loadNpmTasks('grunt-contrib-less')
    grunt.loadNpmTasks('grunt-contrib-uglify')//js的壓縮
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-mocha-test')

    grunt.option('force', true);//不因为语法的错误中断整个服务
    grunt.registerTask('default', ['concurrent'])

    grunt.register('test', ['mochaTest'])
}